import { FernDocsNavigationBuilder } from "@fern-api/docs-importer-commons";

export interface TabInfo {
    name: string;
    url: string;
    navigationBuilder: FernDocsNavigationBuilder;
}
