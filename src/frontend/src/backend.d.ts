import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    name: string;
    description?: string;
    imageUrl?: string;
    category: string;
    brand: string;
    price: bigint;
}
export interface OrderInfo {
    id: bigint;
    totalAmount: bigint;
    customerDetails: CustomerDetails;
    timestamp: bigint;
    items: Array<OrderItem>;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
    price: bigint;
}
export interface Inquiry {
    contact: string;
    name: string;
    message: string;
    timestamp: bigint;
}
export interface UserProfile {
    name: string;
}
export interface CustomerDetails {
    name: string;
    email: string;
    address: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, brand: string, category: string, price: bigint, imageUrl: string | null, description: string | null): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimInitialAdmin(): Promise<void>;
    getAllInquiries(offset: bigint, limit: bigint): Promise<Array<Inquiry>>;
    getAllOrders(): Promise<Array<OrderInfo>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrder(orderId: bigint): Promise<OrderInfo | null>;
    getProduct(productId: bigint): Promise<Product>;
    getProductsByBrand(brand: string): Promise<Array<Product>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasAnyAdmin(): Promise<boolean>;
    importProducts(productImports: Array<{
        name: string;
        description?: string;
        imageUrl?: string;
        category: string;
        brand: string;
        price: bigint;
    }>): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(customerDetails: CustomerDetails, items: Array<OrderItem>): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(term: string): Promise<Array<Product>>;
    submitInquiry(name: string, contact: string, message: string): Promise<void>;
}
