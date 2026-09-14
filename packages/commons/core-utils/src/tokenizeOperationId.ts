import { compact, words } from "lodash-es";

// Only an entirely alphabetic camel/Pascal cased string is split on capital letters; anything
// containing a digit or a separator is split on non-alphanumeric characters instead.
const CAMEL_OR_PASCAL_CASE_REGEX = /^[a-z]+(?:[A-Z][a-z]+)*$/;

/**
 * Splits an operation id or a tag into lowercased tokens, used to line an operation id up with its
 * tag so the duplicated tag prefix can be dropped from the generated name.
 *
 * @param respectWordBoundaries when true, split on every word boundary (camelCase transitions and
 * digits) regardless of the shape of the input. The default only splits on camelCase when the input
 * is entirely alphabetic and camel/Pascal cased, so an id like `Sharing_ListFolderMembers` or
 * `filesGetThumbnailV2` collapses into a single token that can no longer be split.
 */
export function tokenizeOperationId(input: string, respectWordBoundaries = false): string[] {
    if (respectWordBoundaries) {
        return words(input).map((token) => token.toLowerCase());
    }

    const tokens = CAMEL_OR_PASCAL_CASE_REGEX.test(input) ? input.split(/(?=[A-Z])/) : input.split(/[^a-zA-Z0-9]+/);

    return compact(tokens.map((token) => token.toLowerCase()));
}
