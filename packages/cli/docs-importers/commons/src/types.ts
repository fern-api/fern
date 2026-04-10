import { FernDocsNavigationBuilder } from "./FernDocsBuilder.js";

export interface TabInfo {
    name: string;
    url: string;
    navigationBuilder: FernDocsNavigationBuilder;
}
