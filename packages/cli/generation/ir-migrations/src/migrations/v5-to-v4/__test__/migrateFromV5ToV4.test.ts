import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { createMigrationTester } from "../../../__test__/utils/runFixtureThroughMigration";
import { V5_TO_V4_MIGRATION } from "../migrateFromV5ToV4";

const runMigration = createMigrationTester(V5_TO_V4_MIGRATION);

describe("migrateFromV5ToV4", () => {
    it("correctly migrates", async () => {
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), "./fixtures/simple"),
        });

        expect(migrated).toMatchSnapshot();
    });
});
