import type * as core from "../../../../../../../core/index.js";
import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {}
 */
export interface WithLiteralAndEnumTypesServiceRequest {
    file?: core.file.Uploadable | undefined;
    model_type?: SeedApi.fileUpload.ModelType | null;
    open_enum?: SeedApi.fileUpload.OpenEnumType | null;
    maybe_name?: string | null;
}
