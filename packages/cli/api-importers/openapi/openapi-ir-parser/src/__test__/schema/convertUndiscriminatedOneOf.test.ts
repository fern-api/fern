import { OpenAPIV3 } from "openapi-types";
import { getRefSchemaName, getUniqueSubTypeNames } from "../../schema/convertUndiscriminatedOneOf.js";

describe("getRefSchemaName", () => {
    test("extracts last segment from standard component ref", () => {
        expect(getRefSchemaName("#/components/schemas/ToolContent")).toBe("ToolContent");
    });

    test("extracts last segment from deeply nested ref", () => {
        expect(getRefSchemaName("#/components/schemas/nested/deep/MyType")).toBe("MyType");
    });

    test("returns the ref itself when no slashes", () => {
        expect(getRefSchemaName("SimpleRef")).toBe("SimpleRef");
    });
});

describe("getUniqueSubTypeNames", () => {
    test("uses unique object property names when available", () => {
        const schemas: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[] = [
            { type: "object", properties: { email: { type: "string" }, name: { type: "string" } } },
            { type: "object", properties: { phone: { type: "string" }, name: { type: "string" } } }
        ];
        const result = getUniqueSubTypeNames({ schemas });
        expect(result).toEqual(["email", "phone"]);
    });

    test("uses $ref schema name for reference variants", () => {
        const schemas: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[] = [
            { $ref: "#/components/schemas/ToolContent" },
            { type: "string" }
        ];
        const result = getUniqueSubTypeNames({ schemas });
        expect(result).toEqual(["ToolContent", "string"]);
    });

    test("uses primitive type name for typed variants", () => {
        const schemas: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[] = [
            { type: "string" },
            { type: "integer" }
        ];
        const result = getUniqueSubTypeNames({ schemas });
        expect(result).toEqual(["string", "integer"]);
    });

    test("falls back to numeric for duplicate $ref names", () => {
        const schemas: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[] = [
            { $ref: "#/components/schemas/Foo" },
            { $ref: "#/other/schemas/Foo" }
        ];
        const result = getUniqueSubTypeNames({ schemas });
        // Both resolve to "Foo", so both fall back to numeric
        expect(result).toEqual(["zero", "one"]);
    });

    test("falls back to numeric for duplicate primitive types", () => {
        const schemas: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[] = [
            { type: "string" },
            { type: "string" }
        ];
        const result = getUniqueSubTypeNames({ schemas });
        expect(result).toEqual(["zero", "one"]);
    });

    test("mixed: unique properties, $ref, and primitive type", () => {
        const schemas: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[] = [
            { type: "object", properties: { email: { type: "string" } } },
            { $ref: "#/components/schemas/Address" },
            { type: "boolean" }
        ];
        const result = getUniqueSubTypeNames({ schemas });
        expect(result).toEqual(["email", "Address", "boolean"]);
    });

    test("falls back to numeric when no type or ref available", () => {
        const schemas: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[] = [{}, {}];
        const result = getUniqueSubTypeNames({ schemas });
        expect(result).toEqual(["zero", "one"]);
    });

    test("unique property takes priority over primitive type", () => {
        const schemas: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[] = [
            { type: "object", properties: { email: { type: "string" }, name: { type: "string" } } },
            { type: "object", properties: { phone: { type: "string" }, name: { type: "string" } } }
        ];
        const result = getUniqueSubTypeNames({ schemas });
        // Should use unique properties, not "object"/"object"
        expect(result).toEqual(["email", "phone"]);
    });

    test("deduplication only affects colliding names, not all names", () => {
        const schemas: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[] = [
            { $ref: "#/components/schemas/Foo" },
            { $ref: "#/other/schemas/Foo" },
            { type: "string" }
        ];
        const result = getUniqueSubTypeNames({ schemas });
        // "Foo" collides so those two get numeric, "string" is unique and stays
        expect(result).toEqual(["zero", "one", "string"]);
    });
});
