import type * as core from "../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {}
 */
export interface PostServiceRequest {
    maybe_string?: string | null;
    integer?: number;
    file?: core.file.Uploadable | undefined;
    file_list?: core.file.Uploadable | undefined;
    maybe_file?: core.file.Uploadable | undefined;
    maybe_file_list?: core.file.Uploadable | undefined;
    maybe_integer?: number | null;
    optional_list_of_strings?: string[] | null;
    list_of_objects?: SeedApi.fileUpload.MyObject[];
    optional_metadata?: unknown;
    optional_object_type?: SeedApi.fileUpload.ObjectType | null;
    optional_id?: SeedApi.fileUpload.Id | null;
    alias_object?: unknown;
    list_of_alias_object?: unknown[];
    alias_list_of_object?: SeedApi.fileUpload.MyCollectionAliasObject;
}
