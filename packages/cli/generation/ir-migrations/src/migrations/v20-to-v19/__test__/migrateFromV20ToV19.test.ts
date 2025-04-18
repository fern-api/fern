import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { createLogger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V20_TO_V19_MIGRATION } from "../migrateFromV20ToV19";

const runMigration = createMigrationTester(V20_TO_V19_MIGRATION);

describe("migrateFromV20ToV19", () => {
    it("throws when endpoint has file downloading", async () => {
        let output = "";
        const context = createMockTaskContext({
            logger: createLogger((_logLevel, ...logs) => {
                output += logs.join(" ");
            })
        });
        await expect(
            runMigration({
                pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/file-download")),
                context: {
                    taskContext: context
                }
            })
        ).rejects.toBeTruthy();
        expect(output).toContain("does not support file download");
    });
});
