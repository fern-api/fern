import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V3_TO_V2_MIGRATION } from "../migrateFromV3ToV2";

const runMigration = createMigrationTester(V3_TO_V2_MIGRATION);

describe("migrateFromV3ToV2", () => {
    it("adds discriminantValue to errors", async () => {
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"))
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((migrated.ir.services.http[0]?.endpoints[0] as any)?.requestBody).toBeUndefined();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((migrated.ir.services.http[0]?.endpoints[0] as any)?.sdkRequest).toBeUndefined();
        expect(migrated.ir.services.http[0]?.endpoints[0]?.request).toEqual({
            docs: undefined,
            type: {
                _type: "named",
                fernFilepath: [
                    {
                        camelCase: "blog",
                        originalValue: "blog",
                        pascalCase: "Blog",
                        screamingSnakeCase: "BLOG",
                        snakeCase: "blog"
                    }
                ],
                fernFilepathV2: [
                    {
                        safeName: {
                            camelCase: "blog",
                            originalValue: "blog",
                            pascalCase: "Blog",
                            screamingSnakeCase: "BLOG",
                            snakeCase: "blog"
                        },
                        unsafeName: {
                            camelCase: "blog",
                            originalValue: "blog",
                            pascalCase: "Blog",
                            screamingSnakeCase: "BLOG",
                            snakeCase: "blog"
                        }
                    }
                ],
                name: "Blog",
                nameV2: {
                    camelCase: "blog",
                    originalValue: "Blog",
                    pascalCase: "Blog",
                    screamingSnakeCase: "BLOG",
                    snakeCase: "blog"
                },
                nameV3: {
                    safeName: {
                        camelCase: "blog",
                        originalValue: "Blog",
                        pascalCase: "Blog",
                        screamingSnakeCase: "BLOG",
                        snakeCase: "blog"
                    },
                    unsafeName: {
                        camelCase: "blog",
                        originalValue: "Blog",
                        pascalCase: "Blog",
                        screamingSnakeCase: "BLOG",
                        snakeCase: "blog"
                    }
                }
            },
            typeV2: {
                _type: "named",
                fernFilepath: [
                    {
                        camelCase: "blog",
                        originalValue: "blog",
                        pascalCase: "Blog",
                        screamingSnakeCase: "BLOG",
                        snakeCase: "blog"
                    }
                ],
                fernFilepathV2: [
                    {
                        safeName: {
                            camelCase: "blog",
                            originalValue: "blog",
                            pascalCase: "Blog",
                            screamingSnakeCase: "BLOG",
                            snakeCase: "blog"
                        },
                        unsafeName: {
                            camelCase: "blog",
                            originalValue: "blog",
                            pascalCase: "Blog",
                            screamingSnakeCase: "BLOG",
                            snakeCase: "blog"
                        }
                    }
                ],
                name: "Blog",
                nameV2: {
                    camelCase: "blog",
                    originalValue: "Blog",
                    pascalCase: "Blog",
                    screamingSnakeCase: "BLOG",
                    snakeCase: "blog"
                },
                nameV3: {
                    safeName: {
                        camelCase: "blog",
                        originalValue: "Blog",
                        pascalCase: "Blog",
                        screamingSnakeCase: "BLOG",
                        snakeCase: "blog"
                    },
                    unsafeName: {
                        camelCase: "blog",
                        originalValue: "Blog",
                        pascalCase: "Blog",
                        screamingSnakeCase: "BLOG",
                        snakeCase: "blog"
                    }
                }
            }
        });
    });
});
