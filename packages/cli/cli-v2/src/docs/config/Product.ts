import type { Version } from "./Version.js";

export type Product = InternalProduct | ExternalProduct;

export interface InternalProduct {
    type: "internal";
    "display-name": string;
    icon?: string;
    slug?: string;
    path: string;
    versions?: Version[];
}

export interface ExternalProduct {
    type: "external";
    "display-name": string;
    href: string;
    icon?: string;
}
