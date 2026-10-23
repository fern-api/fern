import { removeLeadingSlash, removeTrailingSlash } from "@fern-api/core-utils";
export function normalizePath(str: string): string {
    return removeTrailingSlash(removeLeadingSlash(str));
}
