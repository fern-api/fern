import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { createLogger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { IrVersions } from "../../../ir-versions";
import { V6_TO_V5_MIGRATION } from "../migrateFromV6ToV5";

const runMigration = createMigrationTester(V6_TO_V5_MIGRATION);

describe("migrateFromV6ToV5", () => {
    it("correctly migrates when not using environments", async () => {
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/no-environments"))
        });
        expect(migrated.ir.environments).toEqual([]);
    });

    it("correctly migrates when using one base-url per environment", async () => {
        const migrated = await runMigration({
            pathToFixture: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("./fixtures/single-url-per-environment")
            )
        });

        const expectedEnvironments: IrVersions.V5.environment.Environment[] = [
            {
                docs: undefined,
                id: "Production",
                name: {
                    camelCase: {
                        safeName: "production",
                        unsafeName: "production"
                    },
                    originalName: "Production",
                    pascalCase: {
                        safeName: "Production",
                        unsafeName: "Production"
                    },
                    screamingSnakeCase: {
                        safeName: "PRODUCTION",
                        unsafeName: "PRODUCTION"
                    },
                    snakeCase: {
                        safeName: "production",
                        unsafeName: "production"
                    }
                },
                url: "prod.com"
            },
            {
                docs: "I'm staging",
                id: "Staging",
                name: {
                    camelCase: {
                        safeName: "staging",
                        unsafeName: "staging"
                    },
                    originalName: "Staging",
                    pascalCase: {
                        safeName: "Staging",
                        unsafeName: "Staging"
                    },
                    screamingSnakeCase: {
                        safeName: "STAGING",
                        unsafeName: "STAGING"
                    },
                    snakeCase: {
                        safeName: "staging",
                        unsafeName: "staging"
                    }
                },
                url: "staging.com"
            }
        ];

        expect(migrated.ir.environments).toEqual(expectedEnvironments);
        expect(migrated.ir.defaultEnvironment).toBe("Production");
    });

    it("throws when using multiple base-urls per environment", async () => {
        let output = "";
        const context = createMockTaskContext({
            logger: createLogger((_logLevel, ...logs) => {
                output += logs.join(" ");
            })
        });
        await expect(
            runMigration({
                pathToFixture: join(
                    AbsoluteFilePath.of(__dirname),
                    RelativeFilePath.of("./fixtures/multiple-urls-per-environment")
                ),
                context: {
                    taskContext: context
                }
            })
        ).rejects.toBeTruthy();
        expect(output).toContain("does not support specifying multiple URLs for a single environment");
    });
});
