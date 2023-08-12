import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createLogger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { createMigrationTester } from "../../../__test__/utils/runFixtureThroughMigration";
import { V23_TO_V22_MIGRATION } from "../migrateFromV23ToV22";

const runMigration = createMigrationTester(V23_TO_V22_MIGRATION);

describe("migrateFromV23ToV22", () => {
    it("migrates extensive", async () => {
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/exhaustive")),
        });
        expect(migrated).toMatchSnapshot();
    });

    it("throws when definition contains bytes", async () => {
        let output = "";
        const context = createMockTaskContext({
            logger: createLogger((_logLevel, ...logs) => {
                output += logs.join(" ");
            }),
        });
        await expect(
            runMigration({
                pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/bytes")),
                context: {
                    taskContext: context,
                },
            })
        ).rejects.toBeTruthy();
        expect(output).toContain("does not support bytes requests");
    });
});
