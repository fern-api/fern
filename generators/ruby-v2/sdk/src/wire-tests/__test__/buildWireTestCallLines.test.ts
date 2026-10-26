import { describe, expect, it } from "vitest";
import { buildWireTestCallLines } from "../WireTestGenerator.js";

const SNIPPET = ["client.users.list(", '  starting_after: "cursor",', "  limit: 1", ")", ""].join("\n");

describe("buildWireTestCallLines", () => {
    it("assigns the call and fetches the first page for a lazy paginated endpoint", () => {
        expect(
            buildWireTestCallLines({
                snippetCode: SNIPPET,
                isLazyPagination: true,
                expectsError: false,
                assignResult: false
            })
        ).toEqual([
            "result = client.users.list(",
            '  starting_after: "cursor",',
            "  limit: 1",
            ")",
            "result.pages.next_page"
        ]);
    });

    it("chains the first page fetch onto the call when a paginated endpoint is expected to raise", () => {
        expect(
            buildWireTestCallLines({
                snippetCode: SNIPPET,
                isLazyPagination: true,
                expectsError: true,
                assignResult: false
            })
        ).toEqual(["client.users.list(", '  starting_after: "cursor",', "  limit: 1", ").pages.next_page"]);
    });

    it("assigns the result only when the response is checked", () => {
        const snippetCode = 'client.users.get(id: "id")';
        expect(
            buildWireTestCallLines({ snippetCode, isLazyPagination: false, expectsError: false, assignResult: true })
        ).toEqual(['result = client.users.get(id: "id")']);
        expect(
            buildWireTestCallLines({ snippetCode, isLazyPagination: false, expectsError: true, assignResult: false })
        ).toEqual(['client.users.get(id: "id")']);
    });
});
