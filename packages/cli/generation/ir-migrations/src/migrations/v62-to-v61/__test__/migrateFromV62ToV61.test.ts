import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V62_TO_V61_MIGRATION } from "../migrateFromV62ToV61";

const runMigration = createMigrationTester(V62_TO_V61_MIGRATION);

describe("migrateFromV62ToV61", () => {
    it("simple", async () => {
        const pathToFixture = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"));
        const migrated = await runMigration({
            pathToFixture
        });
        await expect(await migrated.jsonify()).toMatchFileSnapshot("__snapshots__/simple.json");
    });
});
