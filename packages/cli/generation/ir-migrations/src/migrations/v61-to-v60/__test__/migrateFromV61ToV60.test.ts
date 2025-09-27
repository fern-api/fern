import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V61_TO_V60_MIGRATION } from "../migrateFromV61ToV60";

const runMigration = createMigrationTester(V61_TO_V60_MIGRATION);

describe("migrateFromV61ToV60", () => {
    it("simple", async () => {
        const pathToFixture = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"));
        const migrated = await runMigration({
            pathToFixture
        });
        await expect(await migrated.jsonify()).toMatchFileSnapshot("__snapshots__/simple.json");
    });
});
