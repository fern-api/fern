import type * as core from "../../../../../../../core/index.js";
/**
 * @example
 *     {}
 */
export interface JustFileWithOptionalQueryParamsServiceRequest {
    maybeString?: string | null;
    maybeInteger?: number | null;
    file?: core.file.Uploadable | undefined;
}
