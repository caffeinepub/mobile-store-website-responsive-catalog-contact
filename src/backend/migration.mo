import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";

module {
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

  type UserProfile = {
    name : Text;
  };

  type OldActor = {
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, OrderInfo>;
    inquiries : List.List<Inquiry>;
    nextId : Nat;
    productCategories : Set.Set<Text>;
    brands : Set.Set<Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
    accessControlState : AccessControl.AccessControlState;
    // Deprecated admin principal variables
    adminAtomico : Principal;
    adminRhythm : Principal;
    adminTokenAtomico : Text;
    adminTokenRhythm : Text;
    userProvidedTokenForTest : Text;
  };

  type NewActor = {
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, OrderInfo>;
    inquiries : List.List<Inquiry>;
    nextId : Nat;
    productCategories : Set.Set<Text>;
    brands : Set.Set<Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    { old with
      products = old.products;
      orders = old.orders;
      inquiries = old.inquiries;
      nextId = old.nextId;
      productCategories = old.productCategories;
      brands = old.brands;
      userProfiles = old.userProfiles;
      accessControlState = old.accessControlState;
    };
  };
};
