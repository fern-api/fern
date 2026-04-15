import { QueryStringBuilder } from "../../../src/core/url/QueryStringBuilder";

describe("QueryStringBuilder", () => {
    describe("add()", () => {
        it("adds a scalar string value", () => {
            const qs = new QueryStringBuilder().add("key", "value").build();
            expect(qs).toBe("key=value");
        });

        it("adds a scalar number value", () => {
            const qs = new QueryStringBuilder().add("limit", 10).build();
            expect(qs).toBe("limit=10");
        });

        it("adds a boolean value", () => {
            const qs = new QueryStringBuilder().add("active", true).build();
            expect(qs).toBe("active=true");
        });

        it("skips undefined values", () => {
            const qs = new QueryStringBuilder().add("key", undefined).build();
            expect(qs).toBe("");
        });

        it("skips null values", () => {
            const qs = new QueryStringBuilder().add("key", null).build();
            expect(qs).toBe("");
        });

        it("repeats array elements as separate key=value pairs", () => {
            const qs = new QueryStringBuilder().add("color", ["red", "blue", "green"]).build();
            expect(qs).toBe("color=red&color=blue&color=green");
        });

        it("skips null/undefined items within arrays", () => {
            const qs = new QueryStringBuilder().add("color", ["red", null, undefined, "blue"]).build();
            expect(qs).toBe("color=red&color=blue");
        });

        it("returns empty string for empty array", () => {
            const qs = new QueryStringBuilder().add("color", []).build();
            expect(qs).toBe("");
        });

        it("encodes special characters in keys and values", () => {
            const qs = new QueryStringBuilder().add("my key", "hello world").build();
            expect(qs).toBe("my%20key=hello%20world");
        });

        it("handles nested objects", () => {
            const qs = new QueryStringBuilder().add("filter", { status: "active" }).build();
            expect(qs).toBe("filter%5Bstatus%5D=active");
        });
    });

    describe("addComma()", () => {
        it("joins array values with literal commas", () => {
            const qs = new QueryStringBuilder().addComma("tags", ["a", "b", "c"]).build();
            expect(qs).toBe("tags=a%2Cb%2Cc");
        });

        it("handles single-element array", () => {
            const qs = new QueryStringBuilder().addComma("tags", ["only"]).build();
            expect(qs).toBe("tags=only");
        });

        it("returns empty string for empty array", () => {
            const qs = new QueryStringBuilder().addComma("tags", []).build();
            expect(qs).toBe("");
        });

        it("skips undefined values", () => {
            const qs = new QueryStringBuilder().addComma("tags", undefined).build();
            expect(qs).toBe("");
        });

        it("skips null values", () => {
            const qs = new QueryStringBuilder().addComma("tags", null).build();
            expect(qs).toBe("");
        });

        it("treats scalar values same as add()", () => {
            const qs = new QueryStringBuilder().addComma("tag", "single").build();
            expect(qs).toBe("tag=single");
        });

        it("encodes commas within individual values as %2C", () => {
            const qs = new QueryStringBuilder().addComma("items", ["a,b", "c"]).build();
            expect(qs).toBe("items=a%2Cb%2Cc");
        });

        it("encodes special characters in values", () => {
            const qs = new QueryStringBuilder().addComma("tags", ["hello world", "foo&bar"]).build();
            expect(qs).toBe("tags=hello%20world%2Cfoo%26bar");
        });
    });

    describe("chaining", () => {
        it("chains multiple add() calls", () => {
            const qs = new QueryStringBuilder().add("limit", 10).add("offset", 20).build();
            expect(qs).toBe("limit=10&offset=20");
        });

        it("chains add() and addComma() calls", () => {
            const qs = new QueryStringBuilder()
                .add("limit", 10)
                .addComma("tags", ["ACCESS_GRANTED", "COPY", "DELETE"])
                .add("active", true)
                .build();
            expect(qs).toBe("limit=10&tags=ACCESS_GRANTED%2CCOPY%2CDELETE&active=true");
        });

        it("skips undefined params in chain without breaking", () => {
            const qs = new QueryStringBuilder()
                .add("a", "1")
                .add("b", undefined)
                .addComma("c", null)
                .add("d", "4")
                .build();
            expect(qs).toBe("a=1&d=4");
        });
    });

    describe("mergeAdditional()", () => {
        it("appends additional params", () => {
            const qs = new QueryStringBuilder().add("limit", 10).mergeAdditional({ extra: "value" }).build();
            expect(qs).toBe("limit=10&extra=value");
        });

        it("overrides existing keys (last-write-wins)", () => {
            const qs = new QueryStringBuilder().add("limit", 10).mergeAdditional({ limit: 20 }).build();
            expect(qs).toBe("limit=20");
        });

        it("handles undefined additional params", () => {
            const qs = new QueryStringBuilder().add("limit", 10).mergeAdditional(undefined).build();
            expect(qs).toBe("limit=10");
        });

        it("skips undefined values in additional params", () => {
            const qs = new QueryStringBuilder().add("limit", 10).mergeAdditional({ extra: undefined }).build();
            expect(qs).toBe("limit=10");
        });

        it("handles array values in additional params using repeat format", () => {
            const qs = new QueryStringBuilder().mergeAdditional({ ids: [1, 2, 3] }).build();
            expect(qs).toBe("ids=1&ids=2&ids=3");
        });
    });

    describe("build()", () => {
        it("returns empty string when no params added", () => {
            const qs = new QueryStringBuilder().build();
            expect(qs).toBe("");
        });

        it("does not include leading ?", () => {
            const qs = new QueryStringBuilder().add("key", "value").build();
            expect(qs).not.toContain("?");
        });
    });

    describe("end-to-end scenarios", () => {
        it("matches expected query-parameters-openapi output pattern", () => {
            const qs = new QueryStringBuilder()
                .add("limit", 1)
                .add("id", "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
                .add("date", "2023-01-15")
                .add("deadline", "2024-01-15T09:30:00.000Z")
                .add("bytes", "SGVsbG8gd29ybGQh")
                .add("user", "user")
                .add("userList", ["user"])
                .addComma("optionalString", "optionalString")
                .add("nestedUser", "nestedUser")
                .add("excludeUser", "excludeUser")
                .add("filter", "filter")
                .addComma("tags", ["tags"])
                .addComma("optionalTags", undefined)
                .build();
            expect(qs).toContain("limit=1");
            expect(qs).toContain("tags=tags");
            expect(qs).not.toContain("optionalTags");
        });
    });
});
