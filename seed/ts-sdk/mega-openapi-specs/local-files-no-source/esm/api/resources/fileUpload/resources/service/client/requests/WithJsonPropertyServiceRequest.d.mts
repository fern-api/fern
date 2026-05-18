import type * as core from "../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {}
 */
export interface WithJsonPropertyServiceRequest {
    file?: core.file.Uploadable | undefined;
    json?: SeedApi.fileUpload.MyObject | null;
}
