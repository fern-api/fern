import { mergeWithOverrides } from "../mergeWithOverrides";

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
