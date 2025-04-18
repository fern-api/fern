import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V7_TO_V6_MIGRATION } from "../migrateFromV7ToV6";

const runMigration = createMigrationTester(V7_TO_V6_MIGRATION);

describe("migrateFromV7ToV6", () => {
    it("adds name to services", async () => {
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"))
        });
        expect(migrated.ir.services).toEqual([
            {
                availability: {
                    message: undefined,
                    status: "GENERAL_AVAILABILITY"
                },
                basePath: {
                    head: "/",
                    parts: []
                },
                baseUrl: undefined,
                docs: undefined,
                endpoints: [],
                headers: [],
                name: {
                    fernFilepath: [
                        {
                            camelCase: {
                                safeName: "blog",
                                unsafeName: "blog"
                            },
                            originalName: "blog",
                            pascalCase: {
                                safeName: "Blog",
                                unsafeName: "Blog"
                            },
                            screamingSnakeCase: {
                                safeName: "BLOG",
                                unsafeName: "BLOG"
                            },
                            snakeCase: {
                                safeName: "blog",
                                unsafeName: "blog"
                            }
                        }
                    ],
                    name: {
                        camelCase: {
                            safeName: "blogService",
                            unsafeName: "blogService"
                        },
                        originalName: "BlogService",
                        pascalCase: {
                            safeName: "BlogService",
                            unsafeName: "BlogService"
                        },
                        screamingSnakeCase: {
                            safeName: "BLOG_SERVICE",
                            unsafeName: "BLOG_SERVICE"
                        },
                        snakeCase: {
                            safeName: "blog_service",
                            unsafeName: "blog_service"
                        }
                    }
                },
                pathParameters: []
            }
        ]);
    });
});
