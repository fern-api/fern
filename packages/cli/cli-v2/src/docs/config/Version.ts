import type { Navigation } from "./Navigation.js";

export interface Version {
    displayName: string;
    path: string;
    slug?: string;
    availability?: string;
    navigation: Navigation;
}
