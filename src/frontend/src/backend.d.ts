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
export interface Inquiry {
    contact: string;
    name: string;
    message: string;
    timestamp: bigint;
}
export interface backendInterface {
    addProduct(name: string, brand: string, category: string, price: bigint, imageUrl: string | null, description: string | null): Promise<bigint>;
    getAllInquiries(offset: bigint, limit: bigint): Promise<Array<Inquiry>>;
    getAllProducts(): Promise<Array<Product>>;
    getProduct(productId: bigint): Promise<Product>;
    submitInquiry(name: string, contact: string, message: string): Promise<void>;
}
