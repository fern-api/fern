import type * as core from "../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../index.mjs";
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
