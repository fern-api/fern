import type * as core from "../../../../../../../core/index.js";
import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {}
 */
export interface WithContentTypeServiceRequest {
    file?: core.file.Uploadable | undefined;
    foo?: string;
    bar?: SeedApi.fileUpload.MyObject;
    foo_bar?: SeedApi.fileUpload.MyObject | null;
}
