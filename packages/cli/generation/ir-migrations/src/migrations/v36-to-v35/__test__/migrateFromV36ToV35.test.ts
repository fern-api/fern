import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V36_TO_V35_MIGRATION } from "../migrateFromV36ToV35";

const runMigration = createMigrationTester(V36_TO_V35_MIGRATION);

describe("migrateFromV36ToV35", () => {
    it("snapshot", async () => {
        const pathToFixture = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"));
        const migrated = await runMigration({
            pathToFixture
        });
        expect(await migrated.jsonify()).toMatchSnapshot();
    });
});
