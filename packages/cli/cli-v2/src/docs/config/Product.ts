import type { Navigation } from "./Navigation.js";
import type { Version } from "./Version.js";

export type Product = InternalProduct | ExternalProduct;

export interface InternalProduct {
    type: "internal";
    displayName: string;
    icon?: string;
    slug?: string;
    path?: string;
    default?: boolean;
    navigation?: Navigation;
    versions?: Version[];
}

export interface ExternalProduct {
    type: "external";
    displayName: string;
    href: string;
    icon?: string;
}
