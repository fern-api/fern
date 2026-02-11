import { mergeWithOverrides } from "../mergeWithOverrides.js";

describe("mergeWithOverrides", () => {
    it("should merge OpenAPI parameters by identity (name + in), not by index", () => {
        // Per OpenAPI spec, parameters are uniquely identified by name + in combination
        // https://spec.openapis.org/oas/v3.0.3#operation-object
        const data = {
            parameters: [
                { name: "internal", in: "query", description: "Internal param" },
                { name: "token", in: "header", description: "Auth token" },
                { name: "visible", in: "query", description: "Visibility param" }
            ]
        };

        const overrides = {
            parameters: [
                { name: "internal", in: "query", "x-fern-ignore": true },
                { name: "visible", in: "query", "x-fern-ignore": true }
            ]
        };

        const result = mergeWithOverrides({
            data,
            overrides
        });

        // Expected: internal and visible get x-fern-ignore: true
        // token should remain unchanged (NOT get x-fern-ignore from misaligned index)
        expect(result).toEqual({
            parameters: [
                { name: "internal", in: "query", description: "Internal param", "x-fern-ignore": true },
                { name: "token", in: "header", description: "Auth token" },
                { name: "visible", in: "query", description: "Visibility param", "x-fern-ignore": true }
            ]
        });
    });

    it("should add new parameters from overrides", () => {
        const data = {
            parameters: [{ name: "existing", in: "query", description: "Existing param" }]
        };

        const overrides = {
            parameters: [{ name: "new-param", in: "header", description: "New param from override" }]
        };

        const result = mergeWithOverrides({
            data,
            overrides
        });

        expect(result).toEqual({
            parameters: [
                { name: "existing", in: "query", description: "Existing param" },
                { name: "new-param", in: "header", description: "New param from override" }
            ]
        });
    });

    it("should distinguish parameters with same name but different location", () => {
        const data = {
            parameters: [
                { name: "id", in: "query", description: "Query ID" },
                { name: "id", in: "header", description: "Header ID" }
            ]
        };

        const overrides = {
            parameters: [{ name: "id", in: "header", "x-fern-ignore": true }]
        };

        const result = mergeWithOverrides({
            data,
            overrides
        });

        // Only the header "id" should be ignored, not the query "id"
        expect(result).toEqual({
            parameters: [
                { name: "id", in: "query", description: "Query ID" },
                { name: "id", in: "header", description: "Header ID", "x-fern-ignore": true }
            ]
        });
    });

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
