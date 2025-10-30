import { normalizeRefString, normalizeRefsDeep } from "../utils/normalizeRefs";

describe("normalizeRefString", () => {
    it("should handle simple refs without line breaks", () => {
        const ref = "#/components/schemas/User";
        expect(normalizeRefString(ref)).toBe("#/components/schemas/User");
    });

    it("should remove backslash-newline continuation with spaces", () => {
        const ref = "#/components/schemas/Entry\\\n    Fields";
        expect(normalizeRefString(ref)).toBe("#/components/schemas/EntryFields");
    });

    it("should remove backslash-newline continuation with tabs", () => {
        const ref = "#/components/schemas/Entry\\\n\t\tFields";
        expect(normalizeRefString(ref)).toBe("#/components/schemas/EntryFields");
    });

    it("should handle the user's example case", () => {
        const ref =
            "#/components/schemas/EntryFieldsSchema/additionalProperties/anyOf/0/addi\\\n              tionalProperties";
        expect(normalizeRefString(ref)).toBe(
            "#/components/schemas/EntryFieldsSchema/additionalProperties/anyOf/0/additionalProperties"
        );
    });

    it("should handle backslash-CRLF continuation", () => {
        const ref = "#/components/schemas/Entry\\\r\n    Fields";
        expect(normalizeRefString(ref)).toBe("#/components/schemas/EntryFields");
    });

    it("should remove raw newlines (defensive)", () => {
        const ref = "#/components/schemas/Entry\n    Fields";
        expect(normalizeRefString(ref)).toBe("#/components/schemas/EntryFields");
    });

    it("should handle multiple line continuations", () => {
        const ref = "#/components/schemas/Very\\\n    Long\\\n    Path\\\n    Name";
        expect(normalizeRefString(ref)).toBe("#/components/schemas/VeryLongPathName");
    });

    it("should trim leading and trailing whitespace", () => {
        const ref = "  #/components/schemas/User  ";
        expect(normalizeRefString(ref)).toBe("#/components/schemas/User");
    });

    it("should handle single-quoted YAML case with literal backslash", () => {
        const ref = "#/components/schemas/EntryFieldsSchema/additionalProperties/anyOf/0/addi\\ tionalProperties";
        expect(normalizeRefString(ref)).toBe(
            "#/components/schemas/EntryFieldsSchema/additionalProperties/anyOf/0/additionalProperties"
        );
    });

    it("should handle external refs with fragments", () => {
        const ref = "./external.yaml#/components/schemas/Entry\\\n    Fields";
        expect(normalizeRefString(ref)).toBe("./external.yaml#/components/schemas/EntryFields");
    });

    it("should handle non-string values gracefully", () => {
        // biome-ignore lint/suspicious/noExplicitAny: testing non-string input handling
        expect(normalizeRefString(null as any)).toBe(null);
        // biome-ignore lint/suspicious/noExplicitAny: testing non-string input handling
        expect(normalizeRefString(undefined as any)).toBe(undefined);
        // biome-ignore lint/suspicious/noExplicitAny: testing non-string input handling
        expect(normalizeRefString(123 as any)).toBe(123);
    });
});

describe("normalizeRefsDeep", () => {
    it("should normalize $ref in simple object", () => {
        const obj = {
            $ref: "#/components/schemas/Entry\\\n    Fields"
        };
        normalizeRefsDeep(obj);
        expect(obj.$ref).toBe("#/components/schemas/EntryFields");
    });

    it("should normalize nested $ref values", () => {
        const obj = {
            properties: {
                field1: {
                    $ref: "#/components/schemas/Entry\\\n    Fields"
                },
                field2: {
                    $ref: "#/components/schemas/User"
                }
            }
        };
        normalizeRefsDeep(obj);
        expect(obj.properties.field1.$ref).toBe("#/components/schemas/EntryFields");
        expect(obj.properties.field2.$ref).toBe("#/components/schemas/User");
    });

    it("should normalize $ref in arrays", () => {
        const obj = {
            allOf: [{ $ref: "#/components/schemas/Entry\\\n    Fields" }, { $ref: "#/components/schemas/User" }]
        };
        normalizeRefsDeep(obj);
        expect(obj.allOf[0]?.$ref).toBe("#/components/schemas/EntryFields");
        expect(obj.allOf[1]?.$ref).toBe("#/components/schemas/User");
    });

    it("should handle deeply nested structures", () => {
        const obj = {
            components: {
                schemas: {
                    TestSchema: {
                        properties: {
                            field: {
                                allOf: [{ $ref: "#/components/schemas/Entry\\\n    Fields" }]
                            }
                        }
                    }
                }
            }
        };
        normalizeRefsDeep(obj);
        expect(obj.components.schemas.TestSchema.properties.field.allOf[0]?.$ref).toBe(
            "#/components/schemas/EntryFields"
        );
    });

    it("should not modify non-$ref properties", () => {
        const obj = {
            description: "This is a\\\n    multi-line description",
            $ref: "#/components/schemas/Entry\\\n    Fields"
        };
        normalizeRefsDeep(obj);
        expect(obj.description).toBe("This is a\\\n    multi-line description");
        expect(obj.$ref).toBe("#/components/schemas/EntryFields");
    });

    it("should handle null and undefined values", () => {
        expect(normalizeRefsDeep(null)).toBe(null);
        expect(normalizeRefsDeep(undefined)).toBe(undefined);
    });

    it("should handle primitive values", () => {
        expect(normalizeRefsDeep("string")).toBe("string");
        expect(normalizeRefsDeep(123)).toBe(123);
        expect(normalizeRefsDeep(true)).toBe(true);
    });

    it("should handle empty objects and arrays", () => {
        const emptyObj = {};
        normalizeRefsDeep(emptyObj);
        expect(emptyObj).toEqual({});

        // biome-ignore lint/suspicious/noExplicitAny: testing empty array handling
        const emptyArr: any[] = [];
        normalizeRefsDeep(emptyArr);
        expect(emptyArr).toEqual([]);
    });

    it("should handle the complete OpenAPI example from the user", () => {
        const openapi = {
            openapi: "3.0.0",
            components: {
                schemas: {
                    TestResponse: {
                        type: "object",
                        properties: {
                            field: {
                                $ref: "#/components/schemas/EntryFieldsSchema/additionalProperties/anyOf/0/addi\\\n              tionalProperties"
                            }
                        }
                    }
                }
            }
        };
        normalizeRefsDeep(openapi);
        expect(openapi.components.schemas.TestResponse.properties.field.$ref).toBe(
            "#/components/schemas/EntryFieldsSchema/additionalProperties/anyOf/0/additionalProperties"
        );
    });
});
