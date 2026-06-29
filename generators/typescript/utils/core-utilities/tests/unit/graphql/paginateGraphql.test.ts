import { GraphqlPage, paginateGraphql } from "../../../src/core/graphql/paginateGraphql";

async function collect<T>(iterator: AsyncIterableIterator<T>): Promise<T[]> {
    const out: T[] = [];
    for await (const item of iterator) {
        out.push(item);
    }
    return out;
}

describe("paginateGraphql", () => {
    it("yields nodes across pages, following endCursor until hasNextPage is false", async () => {
        const pages: GraphqlPage<string>[] = [
            { nodes: ["a", "b"], endCursor: "c1", hasNextPage: true },
            { nodes: ["c"], endCursor: "c2", hasNextPage: false }
        ];
        const cursors: Array<string | undefined> = [];
        let call = 0;

        const nodes = await collect(
            paginateGraphql<string>({
                fetchPage: async (after) => {
                    cursors.push(after);
                    return pages[call++] as GraphqlPage<string>;
                }
            })
        );

        expect(nodes).toEqual(["a", "b", "c"]);
        // First page has no cursor; second page is fetched with the first page's endCursor.
        expect(cursors).toEqual([undefined, "c1"]);
    });

    it("starts from initialAfter", async () => {
        const cursors: Array<string | undefined> = [];
        await collect(
            paginateGraphql<string>({
                initialAfter: "start",
                fetchPage: async (after) => {
                    cursors.push(after);
                    return { nodes: [], endCursor: undefined, hasNextPage: false };
                }
            })
        );
        expect(cursors).toEqual(["start"]);
    });

    it("stops when the cursor does not advance (defensive against a stuck server)", async () => {
        let call = 0;
        const nodes = await collect(
            paginateGraphql<string>({
                fetchPage: async () => {
                    call++;
                    return { nodes: ["x"], endCursor: "same", hasNextPage: true };
                }
            })
        );
        // First page (after=undefined) advances to "same"; the next page repeats "same", so the cursor
        // is detected as stuck and iteration stops instead of looping forever.
        expect(nodes).toEqual(["x", "x"]);
        expect(call).toBe(2);
    });
});
