import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { createLogger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V23_TO_V22_MIGRATION } from "../migrateFromV23ToV22";

const runMigration = createMigrationTester(V23_TO_V22_MIGRATION);

describe("migrateFromV23ToV22", () => {
    it("migrates extensive", async () => {
        const pathToFixture = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/exhaustive"));
        const migrated = await runMigration({
            pathToFixture
        });
        expect(await migrated.jsonify()).toMatchSnapshot();
    });

    it("skips when definition contains bytes", async () => {
        let output = "";
        const context = createMockTaskContext({
            logger: createLogger((_logLevel, ...logs) => {
                output += logs.join(" ");
            })
        });
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/bytes")),
            context: {
                taskContext: context
            }
        });
        const numEndpoints = Object.entries(migrated.ir.services)[0]?.[1].endpoints.length;
        expect(numEndpoints).toEqual(0);
        expect(output).toContain("does not support bytes requests");
    });
});
