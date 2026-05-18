import type * as core from "../../../../../../../core/index.js";
import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {}
 */
export interface WithFormEncodingServiceRequest {
    file?: core.file.Uploadable | undefined;
    foo?: string;
    bar?: SeedApi.fileUpload.MyObject;
}
