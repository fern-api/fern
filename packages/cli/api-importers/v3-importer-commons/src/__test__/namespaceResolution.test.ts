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

function createContext(namespace?: string): TestConverterContext {
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
        namespace
    });
}

describe("Namespace Resolution", () => {
    describe("getNamespacedSchemaId", () => {
        it("returns schemaId as-is when no namespace is set", () => {
            const context = createContext();
            expect(context.getNamespacedSchemaId("Team")).toBe("Team");
        });

        it("prefixes schemaId with namespace when namespace is set", () => {
            const context = createContext("entity_manager");
            expect(context.getNamespacedSchemaId("Team")).toBe("entity_manager:Team");
        });

        it("is idempotent - does not double-prefix", () => {
            const context = createContext("entity_manager");
            const first = context.getNamespacedSchemaId("Team");
            const second = context.getNamespacedSchemaId(first);
            expect(second).toBe("entity_manager:Team");
        });

        it("handles different namespaces for same schema name", () => {
            const entityCtx = createContext("entity_manager");
            const taskCtx = createContext("task_manager");

            expect(entityCtx.getNamespacedSchemaId("Team")).toBe("entity_manager:Team");
            expect(taskCtx.getNamespacedSchemaId("Team")).toBe("task_manager:Team");
            expect(entityCtx.getNamespacedSchemaId("Team")).not.toBe(taskCtx.getNamespacedSchemaId("Team"));
        });
    });

    describe("getTypeIdFromSchemaReference", () => {
        it("returns namespaced typeId from $ref when namespace is set", () => {
            const context = createContext("entity_manager");
            const ref: OpenAPIV3_1.ReferenceObject = { $ref: "#/components/schemas/Team" };
            expect(context.getTypeIdFromSchemaReference(ref)).toBe("entity_manager:Team");
        });

        it("returns raw typeId from $ref when no namespace", () => {
            const context = createContext();
            const ref: OpenAPIV3_1.ReferenceObject = { $ref: "#/components/schemas/Team" };
            expect(context.getTypeIdFromSchemaReference(ref)).toBe("Team");
        });

        it("returns undefined for non-schema references", () => {
            const context = createContext("entity_manager");
            const ref: OpenAPIV3_1.ReferenceObject = { $ref: "#/components/parameters/TeamId" };
            expect(context.getTypeIdFromSchemaReference(ref)).toBeUndefined();
        });
    });

    describe("getRawSchemaNameFromReference", () => {
        it("returns raw schema name regardless of namespace", () => {
            const context = createContext("entity_manager");
            const ref: OpenAPIV3_1.ReferenceObject = { $ref: "#/components/schemas/Team" };
            expect(context.getRawSchemaNameFromReference(ref)).toBe("Team");
        });

        it("returns undefined for non-schema references", () => {
            const context = createContext("entity_manager");
            const ref: OpenAPIV3_1.ReferenceObject = { $ref: "#/components/parameters/TeamId" };
            expect(context.getRawSchemaNameFromReference(ref)).toBeUndefined();
        });
    });

    describe("createNamedTypeReference", () => {
        it("creates reference with namespaced typeId", () => {
            const context = createContext("entity_manager");
            const ref = context.createNamedTypeReference("Team");
            expect(ref.type).toBe("named");
            if (ref.type === "named") {
                expect(ref.typeId).toBe("entity_manager:Team");
                // Display name should use raw schema name, not namespaced
                expect(ref.name.originalName).toBe("Team");
            }
        });

        it("creates reference without namespace prefix when no namespace", () => {
            const context = createContext();
            const ref = context.createNamedTypeReference("Team");
            expect(ref.type).toBe("named");
            if (ref.type === "named") {
                expect(ref.typeId).toBe("Team");
                expect(ref.name.originalName).toBe("Team");
            }
        });
    });

    describe("convertReferenceToTypeReference", () => {
        it("returns namespaced typeId but raw display name", () => {
            const context = createContext("entity_manager");
            const result = context.convertReferenceToTypeReference({
                reference: { $ref: "#/components/schemas/Team" },
                breadcrumbs: []
            });
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.reference.type).toBe("named");
                if (result.reference.type === "named") {
                    expect(result.reference.typeId).toBe("entity_manager:Team");
                    // Name should be based on raw schema name, not namespaced
                    expect(result.reference.name.originalName).toBe("Team");
                }
            }
        });

        it("two schemas with same name but different namespaces have different typeIds", () => {
            const entityCtx = createContext("entity_manager");
            const taskCtx = createContext("task_manager");

            const entityResult = entityCtx.convertReferenceToTypeReference({
                reference: { $ref: "#/components/schemas/Team" },
                breadcrumbs: []
            });
            const taskResult = taskCtx.convertReferenceToTypeReference({
                reference: { $ref: "#/components/schemas/Team" },
                breadcrumbs: []
            });

            expect(entityResult.ok).toBe(true);
            expect(taskResult.ok).toBe(true);

            if (entityResult.ok && taskResult.ok) {
                if (entityResult.reference.type === "named" && taskResult.reference.type === "named") {
                    // TypeIds must differ
                    expect(entityResult.reference.typeId).not.toBe(taskResult.reference.typeId);
                    expect(entityResult.reference.typeId).toBe("entity_manager:Team");
                    expect(taskResult.reference.typeId).toBe("task_manager:Team");

                    // Display names should be the same (raw schema name)
                    expect(entityResult.reference.name.originalName).toBe("Team");
                    expect(taskResult.reference.name.originalName).toBe("Team");
                }
            }
        });
    });

    describe("getRawSchemaId", () => {
        it("returns schemaId as-is when no namespace is set", () => {
            const context = createContext();
            expect(context.getRawSchemaId("Team")).toBe("Team");
        });

        it("strips namespace prefix when namespace is set", () => {
            const context = createContext("entity_manager");
            expect(context.getRawSchemaId("entity_manager:Team")).toBe("Team");
        });

        it("returns raw id when id is not namespaced", () => {
            const context = createContext("entity_manager");
            expect(context.getRawSchemaId("Team")).toBe("Team");
        });

        it("does not strip a different namespace prefix", () => {
            const context = createContext("entity_manager");
            expect(context.getRawSchemaId("task_manager:Team")).toBe("task_manager:Team");
        });
    });

    describe("removeSchemaFromInlinedTypes", () => {
        it("removes entry with namespaced key when raw id is passed and namespace is set", () => {
            const context = createContext("entity_manager");
            // biome-ignore lint/suspicious/noExplicitAny: test mock — only testing key filtering
            const mockSchema = {} as any;
            const inlinedTypes: Record<string, SchemaConverter.ConvertedSchema> = {
                "entity_manager:Request": mockSchema,
                "entity_manager:Other": mockSchema
            };
            const result = context.removeSchemaFromInlinedTypes({
                id: "Request",
                inlinedTypes
            });
            expect(Object.keys(result)).toEqual(["entity_manager:Other"]);
        });

        it("removes entry when no namespace is set", () => {
            const context = createContext();
            // biome-ignore lint/suspicious/noExplicitAny: test mock — only testing key filtering
            const mockSchema = {} as any;
            const inlinedTypes: Record<string, SchemaConverter.ConvertedSchema> = {
                Request: mockSchema,
                Other: mockSchema
            };
            const result = context.removeSchemaFromInlinedTypes({
                id: "Request",
                inlinedTypes
            });
            expect(Object.keys(result)).toEqual(["Other"]);
        });
    });

    describe("typeReferenceToDeclaredTypeName", () => {
        it("preserves namespaced typeId and raw display name from TypeReference", () => {
            const context = createContext("entity_manager");
            const typeRef = context.createNamedTypeReference("Team");
            const declaredTypeName = context.typeReferenceToDeclaredTypeName(typeRef);

            expect(declaredTypeName).not.toBeUndefined();
            expect(declaredTypeName?.typeId).toBe("entity_manager:Team");
            expect(declaredTypeName?.name.originalName).toBe("Team");
        });

        it("returns undefined for non-named type references", () => {
            const context = createContext("entity_manager");
            const typeRef = TypeReference.unknown();
            expect(context.typeReferenceToDeclaredTypeName(typeRef)).toBeUndefined();
        });
    });
});
