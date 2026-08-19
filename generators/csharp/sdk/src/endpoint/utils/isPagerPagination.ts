import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Whether the C# generator emits a pager (`Pager<T>` / `IAsyncEnumerable<T>`) for the given
 * pagination type. `offset`, `cursor`, and `custom` pagination are generated as pagers, while
 * `uri`/`path` pagination is not yet supported and is instead generated as a regular (unpaged)
 * method that returns the response directly. Callers that decide whether to emit pager-specific
 * code (e.g. `await foreach` snippets) should gate on this.
 */
export function isPagerPagination(pagination: FernIr.Pagination): boolean {
    switch (pagination.type) {
        case "offset":
        case "cursor":
        case "custom":
            return true;
        case "uri":
        case "path":
            return false;
        default:
            return assertNever(pagination);
    }
}
