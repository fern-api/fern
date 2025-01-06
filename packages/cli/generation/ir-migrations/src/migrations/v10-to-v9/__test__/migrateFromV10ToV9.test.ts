import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V10_TO_V9_MIGRATION } from "../migrateFromV10ToV9";

const runMigration = createMigrationTester(V10_TO_V9_MIGRATION);

describe("migrateFromV10ToV9", () => {
    it("add top-level docs to service", async () => {
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"))
        });

        expect(migrated.ir.services["service_no-docs"]?.docs).toBeUndefined();
        expect(migrated.ir.services["service_only-top-level-docs"]?.docs).toBe("top-level docs");
    });
});
