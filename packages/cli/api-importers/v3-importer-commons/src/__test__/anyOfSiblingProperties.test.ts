import { getOpenAPISettings } from "@fern-api/api-workspace-commons";
import { TypeReference } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { AbstractConverterContext } from "../AbstractConverterContext.js";
import { SchemaConverter } from "../converters/schema/SchemaConverter.js";
import { ErrorCollector } from "../ErrorCollector.js";

const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn()
};

/**
 * Concrete subclass of AbstractConverterContext for testing purposes.
 */
class TestConverterContext extends AbstractConverterContext<OpenAPIV3_1.Document> {
    convertReferenceToTypeReference({
        reference
    }: {
        reference: OpenAPIV3_1.ReferenceObject;
        breadcrumbs?: string[];
        displayNameOverride?: string | undefined;
    }):
        | { ok: true; reference: TypeReference; inlinedTypes?: Record<string, SchemaConverter.ConvertedSchema> }
        | { ok: false } {
        const typeId = this.getTypeIdFromSchemaReference(reference);
        if (typeId == null) {
            return { ok: false };
        }
        const rawSchemaName = this.getRawSchemaNameFromReference(reference) ?? typeId;
        return {
            ok: true,
            reference: TypeReference.named({
                fernFilepath: {
                    allParts: [],
                    packagePath: [],
                    file: undefined
                },
                name: this.casingsGenerator.generateName(rawSchemaName),
                typeId,
                displayName: undefined,
                default: undefined,
                inline: false
            })
        };
    }
}

function createContext(settingsOverrides?: Parameters<typeof getOpenAPISettings>[0]): TestConverterContext {
    return new TestConverterContext({
        spec: {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {}
        },
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        logger: mockLogger as any,
        generationLanguage: undefined,
        smartCasing: false,
        exampleGenerationArgs: { disabled: false },
        errorCollector: new ErrorCollector({
            // biome-ignore lint/suspicious/noExplicitAny: test mock
            logger: mockLogger as any
        }),
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        settings: getOpenAPISettings(settingsOverrides),
        namespace: undefined
    });
}

// A schema may declare `properties` alongside an `anyOf` whose branches only mark
// some of those same properties required. Per JSON Schema an instance must satisfy
// both keywords, so the anyOf is an "at least one of" constraint, not a set of
// variants. Converting it as a union dropped the sibling `properties` and made the
// variants mutually exclusive, so a body carrying two of them silently lost one.
describe("anyOf alongside sibling properties", () => {
    const constraintSchema: OpenAPIV3_1.SchemaObject = {
        type: "object",
        properties: {
            autorenewEnabled: { type: "boolean" },
            privacyEnabled: { type: "boolean" },
            locked: { type: "boolean" }
        },
        anyOf: [
            { type: "object", properties: { autorenewEnabled: { type: "boolean" } }, required: ["autorenewEnabled"] },
            { type: "object", properties: { privacyEnabled: { type: "boolean" } }, required: ["privacyEnabled"] },
            { type: "object", properties: { locked: { type: "boolean" } }, required: ["locked"] }
        ]
    };

    function convert(schema: OpenAPIV3_1.SchemaObject, settingsOverrides?: Parameters<typeof getOpenAPISettings>[0]) {
        const context = createContext(settingsOverrides);
        return new SchemaConverter({
            id: "UpdateDomainRequestBody",
            context,
            breadcrumbs: ["paths", "/domains/{domainName}", "patch", "requestBody"],
            schema
        }).convert();
    }

    it("converts to an object carrying every sibling property, not a union", () => {
        const output = convert(constraintSchema);
        const shape = output?.convertedSchema.typeDeclaration.shape;
        expect(shape?.type).toBe("object");
        const propertyNames = shape?.type === "object" ? shape.properties.map((p) => String(p.name)) : [];
        expect(propertyNames.sort()).toEqual(["autorenewEnabled", "locked", "privacyEnabled"]);
    });

    it("marks the properties optional, since the anyOf constraint is not expressible", () => {
        const output = convert(constraintSchema);
        const shape = output?.convertedSchema.typeDeclaration.shape;
        const allOptional = shape?.type === "object" && shape.properties.every((p) => p.valueType.type === "container");
        expect(allOptional).toBe(true);
    });

    it("still converts to a union when preserveAnyOfAsUnion is set", () => {
        const output = convert(constraintSchema, { options: { preserveAnyOfAsUnion: true } });
        expect(output?.convertedSchema.typeDeclaration.shape?.type).toBe("undiscriminatedUnion");
    });

    it("leaves a genuine union alone when a branch introduces a property", () => {
        const output = convert({
            type: "object",
            properties: { shared: { type: "string" } },
            anyOf: [
                { type: "object", properties: { shared: { type: "string" } }, required: ["shared"] },
                { type: "object", properties: { extra: { type: "string" } }, required: ["extra"] }
            ]
        });
        expect(output?.convertedSchema.typeDeclaration.shape?.type).toBe("undiscriminatedUnion");
    });

    // The openapi-ir-parser detector excludes a sibling allOf, so this path must too:
    // otherwise the two importers classify the same schema differently.
    it("leaves a schema alone when an allOf composes with the anyOf", () => {
        const output = convert({
            type: "object",
            properties: { a: { type: "boolean" }, b: { type: "boolean" } },
            allOf: [{ type: "object", properties: { c: { type: "string" } } }],
            anyOf: [
                { type: "object", properties: { a: { type: "boolean" } }, required: ["a"] },
                { type: "object", properties: { b: { type: "boolean" } }, required: ["b"] }
            ]
        });
        expect(output?.convertedSchema.typeDeclaration.shape?.type).not.toBe("object");
    });

    // A branch that narrows a property is a variant, not a presence constraint:
    // collapsing these would discard a real discriminant under a warning that
    // claims to be preserving fields.
    it("leaves a union alone when branches narrow a property to different literals", () => {
        const output = convert({
            type: "object",
            properties: { kind: { type: "string" }, value: { type: "string" } },
            anyOf: [
                { type: "object", properties: { kind: { const: "a" } }, required: ["kind"] },
                { type: "object", properties: { kind: { const: "b" } }, required: ["kind"] }
            ]
        });
        expect(output?.convertedSchema.typeDeclaration.shape?.type).not.toBe("object");
    });

    // A branch that merely names a property, with an empty subschema or one
    // restating the sibling's, is a presence constraint.
    it("treats an empty or restating branch subschema as a presence constraint", () => {
        const branchSubschemas: OpenAPIV3_1.SchemaObject[] = [{}, { type: "boolean" }];
        for (const branchSubschema of branchSubschemas) {
            const output = convert({
                type: "object",
                properties: { a: { type: "boolean" }, b: { type: "boolean" } },
                anyOf: [
                    { type: "object", properties: { a: branchSubschema }, required: ["a"] },
                    { type: "object", properties: { b: branchSubschema }, required: ["b"] }
                ]
            });
            expect(output?.convertedSchema.typeDeclaration.shape?.type).toBe("object");
        }
    });

    // Both converters must accept the array spelling of `type`.
    it('accepts a branch written type: ["object"]', () => {
        const output = convert({
            type: "object",
            properties: { a: { type: "boolean" }, b: { type: "boolean" } },
            anyOf: [
                { type: ["object"], properties: { a: {} }, required: ["a"] },
                { type: ["object"], properties: { b: {} }, required: ["b"] }
            ]
        });
        expect(output?.convertedSchema.typeDeclaration.shape?.type).toBe("object");
    });

    // type: ["object","null"] is an ordinary 3.1 spelling of a nullable object.
    // openapi-ir-parser normalizes it to type:"object" + nullable before reaching
    // the anyOf block, so the constraint is detected there; this path must not
    // silently leave the union in place.
    it("detects the constraint on a nullable object written type: [object, null]", () => {
        const output = convert({
            type: ["object", "null"],
            properties: { a: { type: "boolean" }, b: { type: "boolean" } },
            anyOf: [
                { type: "object", properties: { a: {} }, required: ["a"] },
                { type: "object", properties: { b: {} }, required: ["b"] }
            ]
        });
        // The nullable wrapper becomes an alias over an inlined named type; the
        // constraint must have been applied to that inlined object.
        const inlinedShapes = Object.values(output?.inlinedTypes ?? {}).map((t) => t.typeDeclaration.shape?.type);
        expect(inlinedShapes).toContain("object");
        expect(inlinedShapes).not.toContain("undiscriminatedUnion");
    });

    it("leaves a bare anyOf with no sibling properties alone", () => {
        const output = convert({
            anyOf: [{ type: "string" }, { type: "number" }]
        });
        expect(output?.convertedSchema.typeDeclaration.shape?.type).toBe("undiscriminatedUnion");
    });
});
