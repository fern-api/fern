import { dedupAuthHeaderEntries } from "../dedupAuthHeaderEntries.js";

describe("dedupAuthHeaderEntries", () => {
    it("returns entries unchanged when all header names are unique", () => {
        const items = [
            { headerName: "Authorization", entry: "auth" },
            { headerName: "X-Api-Key", entry: "apiKey" },
            { headerName: "X-Tenant", entry: "tenant" }
        ];
        const result = dedupAuthHeaderEntries(items, (item) => item.headerName);
        expect(result.map((item) => item.entry)).toEqual(["auth", "apiKey", "tenant"]);
    });

    it("keeps the first occurrence when two auth params share a header name", () => {
        // Mirrors the Square OAS pattern: a bearer-token scheme and an
        // apiKey-in-header scheme both produce an `Authorization` header.
        // Without dedup, the generated C# Dictionary initializer throws
        // ArgumentException at runtime.
        const items = [
            { headerName: "Authorization", entry: "bearer-token" },
            { headerName: "Authorization", entry: "client-secret" }
        ];
        const result = dedupAuthHeaderEntries(items, (item) => item.headerName);
        expect(result).toHaveLength(1);
        expect(result[0]?.entry).toBe("bearer-token");
    });

    it("preserves caller-supplied ordering across the dedup boundary", () => {
        // Required > optional > literal ordering must survive deduplication
        // so the most specific scheme wins.
        const items = [
            { headerName: "X-Tenant", entry: "tenant-required" },
            { headerName: "Authorization", entry: "required-auth" },
            { headerName: "Authorization", entry: "optional-auth" },
            { headerName: "X-Api-Key", entry: "literal-apiKey" },
            { headerName: "Authorization", entry: "literal-auth" }
        ];
        const result = dedupAuthHeaderEntries(items, (item) => item.headerName);
        expect(result.map((item) => item.entry)).toEqual(["tenant-required", "required-auth", "literal-apiKey"]);
    });

    it("treats header names case-sensitively", () => {
        // HTTP header names are conventionally case-insensitive, but the
        // generated C# Dictionary uses an ordinal (case-sensitive) comparer
        // by default, so we mirror that here. If callers want case-insensitive
        // dedup they must normalize the key before calling.
        const items = [
            { headerName: "Authorization", entry: "first" },
            { headerName: "authorization", entry: "second" }
        ];
        const result = dedupAuthHeaderEntries(items, (item) => item.headerName);
        expect(result.map((item) => item.entry)).toEqual(["first", "second"]);
    });

    it("returns an empty array when given no items", () => {
        expect(dedupAuthHeaderEntries([], (item: { headerName: string }) => item.headerName)).toEqual([]);
    });
});
