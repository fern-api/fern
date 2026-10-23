import { getOpenAPISettings } from "@fern-api/api-workspace-commons";
import { TypeReference } from "@fern-api/ir-sdk";
import { getWireValue } from "@fern-api/ir-utils";
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
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: this.casingsGenerator.generateName(rawSchemaName),
                typeId,
                displayName: undefined,
                default: undefined,
                inline: false
            })
        };
    }
}

function createContext(): TestConverterContext {
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
        settings: getOpenAPISettings(),
        namespace: undefined
    });
}

// A breadcrumb trail interleaves the structural `properties` keyword with the property
// names it introduces. Dropping every `properties` crumb also drops a property whose name
// happens to be `properties`, so the property's inline schema is named after -- and shares
// a type id with -- the object declaring it. The resulting self-referential type sends
// consumers that walk the type graph (FDR example generation) into unbounded recursion.
describe("a property whose name collides with a structural breadcrumb", () => {
    const breadcrumbsToExtractionConfigSchema = [
        "paths",
        "/v1/document-templates",
        "post",
        "requestBody",
        "content",
        "application/json",
        "schema",
        "properties",
        "data",
        "properties",
        "attributes",
        "properties",
        "extraction_config",
        "properties",
        "schema"
    ];

    // The customer's API has a config field called `schema` holding a JSON Schema, so its
    // sub-schema genuinely declares a property called `properties`.
    const extractionConfigSchema: OpenAPIV3_1.SchemaObject = {
        type: "object",
        properties: {
            properties: { type: "object" }
        },
        required: ["type", "properties", "required"]
    };

    it("keeps the property name rather than filtering it as a keyword", () => {
        const context = createContext();
        expect(
            context.convertBreadcrumbsToName([...breadcrumbsToExtractionConfigSchema, "properties", "properties"])
        ).toBe(
            "V1DocumentTemplatesPostRequestBodyContentApplicationJsonSchemaDataAttributesExtractionConfigSchemaProperties"
        );
    });

    it("still filters the structural crumbs around it", () => {
        const context = createContext();
        expect(context.convertBreadcrumbsToName(breadcrumbsToExtractionConfigSchema)).toBe(
            "V1DocumentTemplatesPostRequestBodyContentApplicationJsonSchemaDataAttributesExtractionConfigSchema"
        );
    });

    it("does not give the property the type id of the object declaring it", () => {
        const context = createContext();
        const id = context.convertBreadcrumbsToName(breadcrumbsToExtractionConfigSchema);

        const output = new SchemaConverter({
            id,
            context,
            breadcrumbs: breadcrumbsToExtractionConfigSchema,
            schema: extractionConfigSchema
        }).convert();

        const shape = output?.convertedSchema.typeDeclaration.shape;
        expect(shape?.type).toBe("object");
        const property =
            shape?.type === "object" ? shape.properties.find((p) => getWireValue(p.name) === "properties") : undefined;
        expect(property).toBeDefined();
        expect(property?.valueType.type === "named" && property.valueType.typeId).not.toBe(id);
        expect(Object.keys(output?.inlinedTypes ?? {})).not.toContain(id);
    });
});
