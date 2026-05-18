import type * as SeedApi from "../../../index.mjs";
export interface CatalogImage {
    id: string;
    caption?: string | undefined;
    url?: string | undefined;
    create_request?: SeedApi.openapiRequestBodyRef.CreateCatalogImageRequest | undefined;
}
