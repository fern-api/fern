import type * as core from "../../../../../../../core/index.mjs";
/**
 * @example
 *     {}
 */
export interface JustFileWithOptionalQueryParamsServiceRequest {
    maybeString?: string | null;
    maybeInteger?: number | null;
    file?: core.file.Uploadable | undefined;
}
