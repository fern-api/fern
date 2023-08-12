import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V9_TO_V8_MIGRATION } from "../migrateFromV9ToV8";

const runMigration = createMigrationTester(V9_TO_V8_MIGRATION);

describe("migrateFromV9ToV8", () => {
    it("migrates maps to list", async () => {
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple")),
        });
        expect(migrated).toMatchObject({
            apiDisplayName: undefined,
            apiDocs: undefined,
            apiName: {
                camelCase: {
                    safeName: "api",
                    unsafeName: "api",
                },
                originalName: "api",
                pascalCase: {
                    safeName: "Api",
                    unsafeName: "Api",
                },
                screamingSnakeCase: {
                    safeName: "API",
                    unsafeName: "API",
                },
                snakeCase: {
                    safeName: "api",
                    unsafeName: "api",
                },
            },
            auth: {
                docs: undefined,
                requirement: "ALL",
                schemes: [],
            },
            constants: {
                errorInstanceIdKey: {
                    name: {
                        camelCase: {
                            safeName: "errorInstanceId",
                            unsafeName: "errorInstanceId",
                        },
                        originalName: "errorInstanceId",
                        pascalCase: {
                            safeName: "ErrorInstanceId",
                            unsafeName: "ErrorInstanceId",
                        },
                        screamingSnakeCase: {
                            safeName: "ERROR_INSTANCE_ID",
                            unsafeName: "ERROR_INSTANCE_ID",
                        },
                        snakeCase: {
                            safeName: "error_instance_id",
                            unsafeName: "error_instance_id",
                        },
                    },
                    wireValue: "errorInstanceId",
                },
            },
            environments: undefined,
            errorDiscriminationStrategy: {
                type: "statusCode",
            },
            errors: [],
            headers: [],
            sdkConfig: {
                isAuthMandatory: false,
            },
            services: [],
            types: [
                {
                    availability: {
                        message: undefined,
                        status: "GENERAL_AVAILABILITY",
                    },
                    docs: undefined,
                    examples: [],
                    name: {
                        fernFilepath: {
                            allParts: [
                                {
                                    camelCase: {
                                        safeName: "file",
                                        unsafeName: "file",
                                    },
                                    originalName: "file",
                                    pascalCase: {
                                        safeName: "File",
                                        unsafeName: "File",
                                    },
                                    screamingSnakeCase: {
                                        safeName: "FILE",
                                        unsafeName: "FILE",
                                    },
                                    snakeCase: {
                                        safeName: "file",
                                        unsafeName: "file",
                                    },
                                },
                            ],
                            file: {
                                camelCase: {
                                    safeName: "file",
                                    unsafeName: "file",
                                },
                                originalName: "file",
                                pascalCase: {
                                    safeName: "File",
                                    unsafeName: "File",
                                },
                                screamingSnakeCase: {
                                    safeName: "FILE",
                                    unsafeName: "FILE",
                                },
                                snakeCase: {
                                    safeName: "file",
                                    unsafeName: "file",
                                },
                            },
                            packagePath: [],
                        },
                        name: {
                            camelCase: {
                                safeName: "stringType",
                                unsafeName: "stringType",
                            },
                            originalName: "StringType",
                            pascalCase: {
                                safeName: "StringType",
                                unsafeName: "StringType",
                            },
                            screamingSnakeCase: {
                                safeName: "STRING_TYPE",
                                unsafeName: "STRING_TYPE",
                            },
                            snakeCase: {
                                safeName: "string_type",
                                unsafeName: "string_type",
                            },
                        },
                    },
                    referencedTypes: [],
                    shape: {
                        _type: "alias",
                        aliasOf: {
                            _type: "primitive",
                            primitive: "STRING",
                        },
                        resolvedType: {
                            _type: "primitive",
                            primitive: "STRING",
                        },
                    },
                },
            ],
        });
    });
});
