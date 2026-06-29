/** One page of a Relay connection: the page's nodes plus the cursor state needed to fetch the next. */
export interface GraphqlPage<TNode> {
    /** The nodes on this page (unwrapped from `edges[].node` or `nodes`). */
    nodes: TNode[];
    /** The cursor to pass as `after` for the next page (`pageInfo.endCursor`), or `undefined` if none. */
    endCursor: string | undefined;
    /** Whether the server reports another page is available (`pageInfo.hasNextPage`). */
    hasNextPage: boolean;
}

export interface PaginateGraphqlArgs<TNode> {
    /**
     * Fetches a single page given the current cursor (`undefined` for the first page). Returns the
     * page's nodes and cursor state. The generated `paginate.*` method supplies this — it requests the
     * connection page (for the caller's node selection) and extracts the nodes/pageInfo.
     */
    fetchPage: (after: string | undefined) => Promise<GraphqlPage<TNode>>;
    /** Starting cursor — the caller's `after` argument, if any. */
    initialAfter?: string;
}

/**
 * Auto-paginates a Relay connection, yielding each node lazily across pages (PRD §10.3). Follows
 * `pageInfo.endCursor` while `pageInfo.hasNextPage` is true, requesting the next page only as the
 * consumer iterates. Breaking out of the `for await` loop stops fetching. Exposed via the SDK's
 * `paginate.<field>(...)` namespace.
 */
export async function* paginateGraphql<TNode>(args: PaginateGraphqlArgs<TNode>): AsyncIterableIterator<TNode> {
    let after = args.initialAfter;
    let hasNextPage = true;
    while (hasNextPage) {
        const page = await args.fetchPage(after);
        for (const node of page.nodes) {
            yield node;
        }
        // Stop when the server says there is no next page, or when it stops advancing the cursor
        // (defensive against a server that reports hasNextPage but returns no new cursor).
        hasNextPage = page.hasNextPage && page.endCursor != null && page.endCursor !== after;
        after = page.endCursor;
    }
}
