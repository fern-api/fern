import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V29_TO_V28_MIGRATION } from "../migrateFromV29ToV28";

const runMigration = createMigrationTester(V29_TO_V28_MIGRATION);

describe("migrateFromV29ToV28", () => {
    it("snapshot", async () => {
        const pathToFixture = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/literal"));
        const migrated = await runMigration({
            pathToFixture,
        });
        expect(migrated).toMatchSnapshot();
    });
});
