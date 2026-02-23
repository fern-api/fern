import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester.js";
import { V47_TO_V46_MIGRATION } from "../migrateFromV47ToV46.js";

const runMigration = createMigrationTester(V47_TO_V46_MIGRATION);

describe("migrateFromV47ToV46", () => {
    it("snapshot", async () => {
        const pathToFixture = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"));
        const migrated = await runMigration({
            pathToFixture
        });
        expect(await migrated.jsonify()).toMatchSnapshot();
    });
});
