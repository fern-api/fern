import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester.js";
import { V36_TO_V35_MIGRATION } from "../migrateFromV36ToV35.js";

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
