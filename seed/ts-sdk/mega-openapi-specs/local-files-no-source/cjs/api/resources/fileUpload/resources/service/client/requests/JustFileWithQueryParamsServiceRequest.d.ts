import type * as core from "../../../../../../../core/index.js";
/**
 * @example
 *     {
 *         integer: 1,
 *         listOfStrings: ["listOfStrings"]
 *     }
 */
export interface JustFileWithQueryParamsServiceRequest {
    maybeString?: string | null;
    integer: number;
    maybeInteger?: number | null;
    listOfStrings?: string | string[];
    optionalListOfStrings?: (string | null) | (string | null)[];
    file?: core.file.Uploadable | undefined;
}
