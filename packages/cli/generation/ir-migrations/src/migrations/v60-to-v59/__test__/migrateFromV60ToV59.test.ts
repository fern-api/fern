import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V60_TO_V59_MIGRATION } from "../migrateFromV60ToV59";

const runMigration = createMigrationTester(V60_TO_V59_MIGRATION);

describe("migrateFromV60ToV59", () => {
    it("property-access", async () => {
        const pathToFixture = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/property-access"));
        const migrated = await runMigration({
            pathToFixture
        });
        expect(await migrated.jsonify()).toMatchSnapshot();
    });
});
