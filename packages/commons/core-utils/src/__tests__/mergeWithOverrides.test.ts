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

    it("should merge named arrays by name identity instead of by index", () => {
        const data = {
            paths: {
                "/test": {
                    get: {
                        parameters: [
                            { name: "region", in: "path", required: true, schema: { type: "string" } },
                            { name: "version", in: "header", schema: { type: "string" } },
                            { name: "limit", in: "query", schema: { type: "integer" } }
                        ]
                    }
                }
            }
        };

        const overrides = {
            paths: {
                "/test": {
                    get: {
                        parameters: [
                            { name: "limit", "x-fern-default": "100" },
                            { name: "region", "x-fern-default": "us-east-1" }
                        ]
                    }
                }
            }
        };

        const result = mergeWithOverrides({ data, overrides });

        const params = (result as typeof data).paths["/test"].get.parameters;
        expect(params).toHaveLength(3);
        expect(params[0]).toEqual({
            name: "region",
            in: "path",
            required: true,
            schema: { type: "string" },
            "x-fern-default": "us-east-1"
        });
        expect(params[1]).toEqual({
            name: "version",
            in: "header",
            schema: { type: "string" }
        });
        expect(params[2]).toEqual({
            name: "limit",
            in: "query",
            schema: { type: "integer" },
            "x-fern-default": "100"
        });
    });

    it("should append override items when no name match exists in base array", () => {
        const data = {
            parameters: [{ name: "region", in: "path", schema: { type: "string" } }]
        };

        const overrides = {
            parameters: [{ name: "newParam", in: "query", "x-fern-default": "test" }]
        };

        const result = mergeWithOverrides({ data, overrides });

        const params = (result as typeof data).parameters;
        expect(params).toHaveLength(2);
        expect(params[0]).toEqual({ name: "region", in: "path", schema: { type: "string" } });
        expect(params[1]).toEqual({ name: "newParam", in: "query", "x-fern-default": "test" });
    });

    it("should fall back to index-based merging for arrays without name properties", () => {
        const data = {
            items: [
                { id: 1, value: "a" },
                { id: 2, value: "b" }
            ]
        };

        const overrides = {
            items: [{ id: 1, extra: true }]
        };

        const result = mergeWithOverrides({ data, overrides });

        expect((result as typeof data).items).toEqual([
            { id: 1, value: "a", extra: true },
            { id: 2, value: "b" }
        ]);
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
