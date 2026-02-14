import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Migration "migration";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Use migration on upgrade/publish
(with migration = Migration.run)
actor {
  type Product = {
    id : Nat;
    name : Text;
    brand : Text;
    category : Text;
    price : Nat;
    imageUrl : ?Text;
    description : ?Text;
  };

  type Inquiry = {
    timestamp : Int;
    name : Text;
    contact : Text;
    message : Text;
  };

  type CustomerDetails = {
    name : Text;
    phone : Text;
    email : Text;
    address : Text;
  };

  type OrderItem = {
    productId : Nat;
    quantity : Nat;
    price : Nat;
  };

  type OrderInfo = {
    id : Nat;
    timestamp : Int;
    customerDetails : CustomerDetails;
    items : [OrderItem];
    totalAmount : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, OrderInfo>();
  var inquiries = List.empty<Inquiry>();
  var nextId = 1;
  let productCategories = Set.empty<Text>();
  let brands = Set.empty<Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Initialize access control state
  let accessControlState = AccessControl.initState();

  // Mixin authorization logic
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management - Admin only
  public shared ({ caller }) func addProduct(
    name : Text,
    brand : Text,
    category : Text,
    price : Nat,
    imageUrl : ?Text,
    description : ?Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let productId = nextId;
    let newProduct : Product = {
      id = productId;
      name;
      brand;
      category;
      price;
      imageUrl;
      description;
    };
    products.add(productId, newProduct);
    nextId += 1;
    productId;
  };

  // Product queries - accessible to all
  public query func getProduct(productId : Nat) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(
      func(p : Product) : Bool { p.category == category }
    );
  };

  public query func getProductsByBrand(brand : Text) : async [Product] {
    products.values().toArray().filter(
      func(p : Product) : Bool { p.brand == brand }
    );
  };

  public query func searchProducts(term : Text) : async [Product] {
    let lowerTerm = term.toLower();
    products.values().toArray().filter(
      func(p : Product) : Bool { p.name.toLower().contains(#text lowerTerm) }
    );
  };

  // Product import - Admin only
  public shared ({ caller }) func importProducts(
    productImports : [{
      name : Text;
      brand : Text;
      category : Text;
      price : Nat;
      imageUrl : ?Text;
      description : ?Text;
    }],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can import products");
    };

    for (p in productImports.vals()) {
      let product : Product = {
        id = nextId;
        name = p.name;
        brand = p.brand;
        category = p.category;
        price = p.price;
        imageUrl = p.imageUrl;
        description = p.description;
      };
      products.add(nextId, product);
      nextId += 1;
    };
  };

  // Inquiry Management - Submit is public, view is admin-only
  public shared func submitInquiry(name : Text, contact : Text, message : Text) : async () {
    let inquiry : Inquiry = {
      timestamp = Time.now();
      name;
      contact;
      message;
    };
    inquiries.add(inquiry);
  };

  public query ({ caller }) func getAllInquiries(offset : Nat, limit : Nat) : async [Inquiry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view inquiries");
    };
    let inquiriesArray = inquiries.toArray();
    if (inquiriesArray.size() == 0) { return [] };
    let end = Nat.min(offset + limit, inquiriesArray.size());
    if (offset >= end) { return [] };
    inquiries.sliceToArray(offset, end);
  };

  // Order Management - Place order is public, view is admin-only
  public shared ({ caller }) func placeOrder(customerDetails : CustomerDetails, items : [OrderItem]) : async Nat {
    // No authorization check - public function
    if (items.size() == 0) {
      Runtime.trap("No items in order");
    };
    let _timestamp = Time.now();
    let totalAmount = calculateTotal(items);
    let orderId = nextId;
    let order : OrderInfo = {
      id = orderId;
      timestamp = Time.now();
      customerDetails;
      items;
      totalAmount;
    };
    orders.add(orderId, order);
    nextId += 1;
    orderId;
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?OrderInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view orders");
    };
    orders.get(orderId);
  };

  public query ({ caller }) func getAllOrders() : async [OrderInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view orders");
    };
    orders.values().toArray();
  };

  func calculateTotal(items : [OrderItem]) : Nat {
    var total = 0;
    for (item in items.vals()) {
      total += item.price * item.quantity;
    };
    total;
  };
};
