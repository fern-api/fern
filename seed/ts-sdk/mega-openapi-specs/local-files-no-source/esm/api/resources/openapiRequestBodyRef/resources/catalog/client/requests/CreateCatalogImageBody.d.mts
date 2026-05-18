import type * as core from "../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         request: {
 *             catalog_object_id: "catalog_object_id"
 *         }
 *     }
 */
export interface CreateCatalogImageBody {
    request: SeedApi.openapiRequestBodyRef.CreateCatalogImageRequest;
    image_file?: core.file.Uploadable | undefined;
}
