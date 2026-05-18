import type * as core from "../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../index.mjs";
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
