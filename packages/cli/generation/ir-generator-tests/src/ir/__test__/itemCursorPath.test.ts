import { parseNextCursorPath } from "@fern-api/ir-generator";

describe("parseNextCursorPath", () => {
    it("treats an unindexed path as a response property", () => {
        expect(parseNextCursorPath(["page", "next"])).toEqual({ type: "responseProperty" });
    });

    it("parses the last element", () => {
        expect(parseNextCursorPath(["data[-1]", "token"])).toEqual({
            type: "itemCursor",
            resultsComponents: ["data"],
            itemComponents: ["token"],
            element: "last"
        });
    });

    it("parses the first element", () => {
        expect(parseNextCursorPath(["page", "data[0]", "cursor", "token"])).toEqual({
            type: "itemCursor",
            resultsComponents: ["page", "data"],
            itemComponents: ["cursor", "token"],
            element: "first"
        });
    });

    it("rejects unsupported indices", () => {
        expect(parseNextCursorPath(["data[2]", "token"])).toEqual({
            type: "invalid",
            message:
                "'[2]' is not a supported results index; only '[0]' (the first element) and '[-1]' (the last element) are supported"
        });
    });

    it("rejects multiple indices", () => {
        expect(parseNextCursorPath(["data[-1]", "items[-1]", "token"])).toEqual({
            type: "invalid",
            message: "the cursor may only be read from a single element of the results"
        });
    });

    it("rejects an index with no property after it", () => {
        expect(parseNextCursorPath(["data[-1]"])).toEqual({
            type: "invalid",
            message: "the cursor must be a property of the indexed element (e.g. $response.data[-1].token)"
        });
    });
});
