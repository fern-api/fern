import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getIntermediateRepresentationMigrator } from "../../../IntermediateRepresentationMigrator";
import { getIrForApi } from "../../../__test__/utils/getIrForApi";
import { V3_TO_V2_MIGRATION } from "../migrateFromV3ToV2";

describe("migrateFromV3ToV2", () => {
    it("adds discriminantValue to errors", async () => {
        const migrated = getIntermediateRepresentationMigrator().migrateThroughMigration({
            migration: V3_TO_V2_MIGRATION,
            intermediateRepresentation: await getIrForApi(join(AbsoluteFilePath.of(__dirname), "./fixtures/simple")),
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((migrated.services.http[0]?.endpoints[0] as any)?.requestBody).toBeUndefined();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((migrated.services.http[0]?.endpoints[0] as any)?.sdkRequest).toBeUndefined();
        expect(migrated.services.http[0]?.endpoints[0]?.request).toEqual({
            docs: undefined,
            type: {
                _type: "named",
                fernFilepath: [
                    {
                        camelCase: "blog",
                        originalValue: "blog",
                        pascalCase: "Blog",
                        screamingSnakeCase: "BLOG",
                        snakeCase: "blog",
                    },
                ],
                fernFilepathV2: [
                    {
                        safeName: {
                            camelCase: "blog",
                            originalValue: "blog",
                            pascalCase: "Blog",
                            screamingSnakeCase: "BLOG",
                            snakeCase: "blog",
                        },
                        unsafeName: {
                            camelCase: "blog",
                            originalValue: "blog",
                            pascalCase: "Blog",
                            screamingSnakeCase: "BLOG",
                            snakeCase: "blog",
                        },
                    },
                ],
                name: "Blog",
                nameV2: {
                    camelCase: "blog",
                    originalValue: "Blog",
                    pascalCase: "Blog",
                    screamingSnakeCase: "BLOG",
                    snakeCase: "blog",
                },
                nameV3: {
                    safeName: {
                        camelCase: "blog",
                        originalValue: "Blog",
                        pascalCase: "Blog",
                        screamingSnakeCase: "BLOG",
                        snakeCase: "blog",
                    },
                    unsafeName: {
                        camelCase: "blog",
                        originalValue: "Blog",
                        pascalCase: "Blog",
                        screamingSnakeCase: "BLOG",
                        snakeCase: "blog",
                    },
                },
            },
            typeV2: {
                _type: "named",
                fernFilepath: [
                    {
                        camelCase: "blog",
                        originalValue: "blog",
                        pascalCase: "Blog",
                        screamingSnakeCase: "BLOG",
                        snakeCase: "blog",
                    },
                ],
                fernFilepathV2: [
                    {
                        safeName: {
                            camelCase: "blog",
                            originalValue: "blog",
                            pascalCase: "Blog",
                            screamingSnakeCase: "BLOG",
                            snakeCase: "blog",
                        },
                        unsafeName: {
                            camelCase: "blog",
                            originalValue: "blog",
                            pascalCase: "Blog",
                            screamingSnakeCase: "BLOG",
                            snakeCase: "blog",
                        },
                    },
                ],
                name: "Blog",
                nameV2: {
                    camelCase: "blog",
                    originalValue: "Blog",
                    pascalCase: "Blog",
                    screamingSnakeCase: "BLOG",
                    snakeCase: "blog",
                },
                nameV3: {
                    safeName: {
                        camelCase: "blog",
                        originalValue: "Blog",
                        pascalCase: "Blog",
                        screamingSnakeCase: "BLOG",
                        snakeCase: "blog",
                    },
                    unsafeName: {
                        camelCase: "blog",
                        originalValue: "Blog",
                        pascalCase: "Blog",
                        screamingSnakeCase: "BLOG",
                        snakeCase: "blog",
                    },
                },
            },
        });
    });
});
