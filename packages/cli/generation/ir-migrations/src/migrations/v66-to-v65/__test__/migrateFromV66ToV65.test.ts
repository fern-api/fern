import { createMockTaskContext } from "@fern-api/task-context";

import { IrVersions } from "../../../ir-versions";
import { V66_TO_V65_MIGRATION } from "../migrateFromV66ToV65";

describe("migrateFromV66ToV65", () => {
    const mockContext = {
        taskContext: createMockTaskContext(),
        targetGenerator: {
            name: "test-generator",
            version: "0.0.0"
        }
    };

    const createFullName = (original: string): IrVersions.V66.Name => ({
        originalName: original,
        camelCase: {
            unsafeName: original.charAt(0).toLowerCase() + original.slice(1),
            safeName: original.charAt(0).toLowerCase() + original.slice(1)
        },
        pascalCase: {
            unsafeName: original.charAt(0).toUpperCase() + original.slice(1),
            safeName: original.charAt(0).toUpperCase() + original.slice(1)
        },
        snakeCase: { unsafeName: original.toLowerCase(), safeName: original.toLowerCase() },
        screamingSnakeCase: { unsafeName: original.toUpperCase(), safeName: original.toUpperCase() }
    });

    const createMinimalV66IR = (
        overrides?: Partial<IrVersions.V66.IntermediateRepresentation>
    ): IrVersions.V66.IntermediateRepresentation => {
        return {
            apiName: createFullName("TestApi"),
            apiDisplayName: undefined,
            apiDocs: undefined,
            auth: {
                docs: undefined,
                requirement: "ALL",
                schemes: []
            },
            headers: [],
            idempotencyHeaders: [],
            types: {},
            errors: {},
            services: {},
            webhookGroups: {},
            websocketChannels: {},
            subpackages: {},
            rootPackage: {
                fernFilepath: {
                    allParts: [],
                    packagePath: [],
                    file: undefined
                },
                service: undefined,
                types: [],
                errors: [],
                subpackages: [],
                docs: undefined,
                webhooks: undefined,
                websocket: undefined,
                hasEndpointsInTree: false,
                navigationConfig: undefined
            },
            constants: {
                errorInstanceIdKey: {
                    name: createFullName("errorInstanceId"),
                    wireValue: "errorInstanceId"
                }
            },
            environments: undefined,
            basePath: undefined,
            pathParameters: [],
            errorDiscriminationStrategy: { type: "statusCode" },
            sdkConfig: {
                hasFileDownloadEndpoints: false,
                hasPaginatedEndpoints: false,
                hasStreamingEndpoints: false,
                isAuthMandatory: false,
                platformHeaders: {
                    language: "X-Fern-Language",
                    sdkName: "X-Fern-SDK-Name",
                    sdkVersion: "X-Fern-SDK-Version",
                    userAgent: undefined
                }
            },
            variables: [],
            serviceTypeReferenceInfo: {
                sharedTypes: [],
                typesReferencedOnlyByService: {}
            },
            readmeConfig: undefined,
            sourceConfig: undefined,
            publishConfig: undefined,
            dynamic: undefined,
            smartCasing: false,
            generationLanguage: undefined,
            ...overrides
        } as unknown as IrVersions.V66.IntermediateRepresentation;
    };

    it("removes smartCasing from migrated IR", () => {
        const v66IR = createMinimalV66IR({ smartCasing: true });
        const migratedIR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

        // smartCasing should not exist on v65 IR
        // biome-ignore lint/suspicious/noExplicitAny: test assertion on removed field
        expect((migratedIR as any).smartCasing).toBeUndefined();
    });

    it("removes generationLanguage from migrated IR", () => {
        const v66IR = createMinimalV66IR({ generationLanguage: "python" });
        const migratedIR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

        // generationLanguage should not exist on v65 IR
        // biome-ignore lint/suspicious/noExplicitAny: test assertion on removed field
        expect((migratedIR as any).generationLanguage).toBeUndefined();
    });

    it("preserves all other IR fields when migrating", () => {
        const v66IR = createMinimalV66IR({
            smartCasing: false,
            generationLanguage: undefined,
            apiDocs: "Test API documentation"
        });
        const migratedIR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

        expect(migratedIR.apiDocs).toBe("Test API documentation");
        expect(migratedIR.apiName.originalName).toBe("TestApi");
        expect(migratedIR.apiName.camelCase).toBeDefined();
        expect(migratedIR.apiName.pascalCase).toBeDefined();
        expect(migratedIR.apiName.snakeCase).toBeDefined();
        expect(migratedIR.apiName.screamingSnakeCase).toBeDefined();
    });

    it("preserves Name casings that are already present", () => {
        const v66IR = createMinimalV66IR();
        const migratedIR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

        // Name casings should pass through unchanged since they're already present
        expect(migratedIR.apiName.originalName).toBe("TestApi");
        expect(migratedIR.apiName.camelCase!.unsafeName).toBe("testApi");
        expect(migratedIR.apiName.pascalCase!.unsafeName).toBe("TestApi");
    });

    it("handles both smartCasing and generationLanguage being set", () => {
        const v66IR = createMinimalV66IR({
            smartCasing: true,
            generationLanguage: "go"
        });
        const migratedIR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

        // Both fields should be removed
        // biome-ignore lint/suspicious/noExplicitAny: test assertion on removed fields
        const migratedRecord = migratedIR as any;
        expect(migratedRecord.smartCasing).toBeUndefined();
        expect(migratedRecord.generationLanguage).toBeUndefined();

        // But the rest of the IR should be intact
        expect(migratedIR.apiName.originalName).toBe("TestApi");
    });

    it("handles undefined smartCasing and generationLanguage", () => {
        const v66IR = createMinimalV66IR({
            smartCasing: undefined,
            generationLanguage: undefined
        });
        const migratedIR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

        // biome-ignore lint/suspicious/noExplicitAny: test assertion on removed fields
        const migratedRecord = migratedIR as any;
        expect(migratedRecord.smartCasing).toBeUndefined();
        expect(migratedRecord.generationLanguage).toBeUndefined();
    });

    it("preserves Set instances (e.g., referencedTypes) without converting to plain objects", () => {
        const referencedTypes = new Set(["type_a", "type_b"]);
        const v66IR = createMinimalV66IR({
            types: {
                type_test: {
                    name: {
                        name: createFullName("TestType"),
                        fernFilepath: {
                            allParts: [],
                            packagePath: [],
                            file: undefined
                        }
                    },
                    shape: { _type: "alias" as const, aliasOf: { _type: "unknown" as const } },
                    referencedTypes: referencedTypes,
                    examples: [],
                    userProvidedExamples: [],
                    autogeneratedExamples: [],
                    docs: undefined,
                    availability: undefined,
                    inline: undefined,
                    source: undefined,
                    encoding: undefined
                }
            } as unknown as IrVersions.V66.IntermediateRepresentation["types"]
        });
        const migratedIR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

        // biome-ignore lint/suspicious/noExplicitAny: test accessing internal types structure
        const types = (migratedIR as any).types;
        expect(types.type_test.referencedTypes).toBeInstanceOf(Set);
        expect(types.type_test.referencedTypes.size).toBe(2);
    });
});
