import { mergeWithOverrides } from "../mergeWithOverrides.js";

describe("mergeWithOverrides", () => {
    it("should handle schema with null examples", () => {
        const schema1 = {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    examples: {
                        example1: null,
                        example2: null
                    }
                }
            }
        };

        const result = mergeWithOverrides({
            data: schema1,
            overrides: {},
            allowNullKeys: ["examples"]
        });

        expect(result).toEqual(schema1);
    });

    it("should handle schema without null examples", () => {
        const schema2 = {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    examples: {
                        example1: "John",
                        example2: null
                    }
                }
            }
        };

        const result = mergeWithOverrides({
            data: schema2,
            overrides: {}
        });

        expect(result).toEqual({
            type: "object",
            properties: {
                name: {
                    type: "string",
                    examples: {
                        example1: "John"
                    }
                }
            }
        });
    });

    it("should merge arrays of objects", () => {
        const data = {
            items: [
                { id: 1, name: "Item 1" },
                { id: 2, name: "Item 2" }
            ]
        };

        const overrides = {
            items: [{ id: 1, description: "Updated Item 1" }]
        };

        const result = mergeWithOverrides({
            data,
            overrides
        });

        expect(result).toEqual({
            items: [
                { id: 1, name: "Item 1", description: "Updated Item 1" },
                { id: 2, name: "Item 2" }
            ]
        });
    });

    it("should merge named arrays by name rather than by position", () => {
        const data = {
            parameters: [
                { name: "cursor", in: "query", schema: { type: "string" } },
                { name: "limit", in: "query", schema: { type: "integer" } },
                { name: "color", in: "query", schema: { type: "string" } }
            ]
        };

        const overrides = {
            parameters: [
                {
                    name: "color",
                    in: "query",
                    explode: false,
                    schema: { type: "array", items: { type: "string", enum: ["red", "green", "blue"] } }
                }
            ]
        };

        const result = mergeWithOverrides({ data, overrides });

        expect(result).toEqual({
            parameters: [
                { name: "cursor", in: "query", schema: { type: "string" } },
                { name: "limit", in: "query", schema: { type: "integer" } },
                {
                    name: "color",
                    in: "query",
                    explode: false,
                    schema: { type: "array", items: { type: "string", enum: ["red", "green", "blue"] } }
                }
            ]
        });
    });

    it("should disambiguate same-named parameters by location", () => {
        const data = {
            parameters: [
                { name: "id", in: "path", schema: { type: "string" } },
                { name: "id", in: "query", schema: { type: "string" } }
            ]
        };

        const result = mergeWithOverrides({
            data,
            overrides: { parameters: [{ name: "id", in: "query", description: "the query id" }] }
        });

        expect(result).toEqual({
            parameters: [
                { name: "id", in: "path", schema: { type: "string" } },
                { name: "id", in: "query", schema: { type: "string" }, description: "the query id" }
            ]
        });
    });

    it("should append named entries that match nothing", () => {
        const result = mergeWithOverrides({
            data: { parameters: [{ name: "cursor", in: "query" }] },
            overrides: { parameters: [{ name: "limit", in: "query", schema: { type: "integer" } }] }
        });

        expect(result).toEqual({
            parameters: [
                { name: "cursor", in: "query" },
                { name: "limit", in: "query", schema: { type: "integer" } }
            ]
        });
    });

    it("should replace arrays of primitives", () => {
        const data = {
            tags: ["tag1", "tag2"]
        };

        const overrides = {
            tags: ["tag3", "tag4"]
        };

        const result = mergeWithOverrides({
            data,
            overrides
        });

        expect(result).toEqual({
            tags: ["tag3", "tag4"]
        });
    });

    it("should handle nested object merging", () => {
        const data = {
            config: {
                settings: {
                    theme: "light",
                    notifications: true
                }
            }
        };

        const overrides = {
            config: {
                settings: {
                    theme: "dark",
                    sound: false
                }
            }
        };

        const result = mergeWithOverrides({
            data,
            overrides
        });

        expect(result).toEqual({
            config: {
                settings: {
                    theme: "dark",
                    notifications: true,
                    sound: false
                }
            }
        });
    });
});
