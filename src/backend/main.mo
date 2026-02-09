import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Nat "mo:core/Nat";

actor {
  public type Product = {
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

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  let products = Map.empty<Nat, Product>();
  let inquiries = List.empty<Inquiry>();
  var nextProductId = 1;

  public shared ({ caller }) func addProduct(name : Text, brand : Text, category : Text, price : Nat, imageUrl : ?Text, description : ?Text) : async Nat {
    let productId = nextProductId;
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
    nextProductId += 1;
    productId;
  };

  public query ({ caller }) func getProduct(productId : Nat) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public shared ({ caller }) func submitInquiry(name : Text, contact : Text, message : Text) : async () {
    let inquiry : Inquiry = {
      timestamp = Time.now();
      name;
      contact;
      message;
    };
    inquiries.add(inquiry);
  };

  public query ({ caller }) func getAllInquiries(offset : Nat, limit : Nat) : async [Inquiry] {
    let inquiriesSize = inquiries.size();
    if (inquiriesSize == 0) { return [] };
    let end = Nat.min(offset + limit, inquiriesSize);
    if (offset >= end) { return [] };
    inquiries.sliceToArray(offset, end);
  };
};
