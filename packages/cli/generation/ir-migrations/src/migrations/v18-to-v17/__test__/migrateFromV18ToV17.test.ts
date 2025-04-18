import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { createLogger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V18_TO_V17_MIGRATION } from "../migrateFromV18ToV17";

const runMigration = createMigrationTester(V18_TO_V17_MIGRATION);

describe("migrateFromV18ToV17", () => {
    it("correct migrates service urls", async () => {
        const migrated = await runMigration({
            pathToFixture: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("./fixtures/all-endpoints-same-url")
            )
        });

        expect(Object.values(migrated.ir.services)[0]?.baseUrl).toBe("A");
    });

    it("throws when endpoints have different urls", async () => {
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
                    RelativeFilePath.of("./fixtures/different-endpoint-urls")
                ),
                context: {
                    taskContext: context
                }
            })
        ).rejects.toBeTruthy();
        expect(output).toContain("does not support endpoint-level server URLs");
    });
});
