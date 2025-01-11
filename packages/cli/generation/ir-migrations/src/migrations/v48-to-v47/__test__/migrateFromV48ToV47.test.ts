import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V48_TO_V47_MIGRATION } from "../migrateFromV48ToV47";

const runMigration = createMigrationTester(V48_TO_V47_MIGRATION);

describe("migrateFromV48ToV47", () => {
    it("simple", async () => {
        const pathToFixture = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"));
        const migrated = await runMigration({
            pathToFixture
        });
        expect(await migrated.jsonify()).toMatchSnapshot();
    });
    it("remove-all-pagination", async () => {
        const pathToFixture = join(
            AbsoluteFilePath.of(__dirname),
            RelativeFilePath.of("./fixtures/remove-all-pagination")
        );
        const migrated = await runMigration({
            pathToFixture
        });
        expect(await migrated.jsonify()).toMatchSnapshot();
    });
});
