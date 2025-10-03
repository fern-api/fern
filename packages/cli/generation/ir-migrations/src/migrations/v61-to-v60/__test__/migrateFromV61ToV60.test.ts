import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V61_TO_V60_MIGRATION } from "../migrateFromV61ToV60";

const runMigration = createMigrationTester(V61_TO_V60_MIGRATION);

describe("migrateFromV61ToV60", () => {
    it("streaming", async () => {
        const pathToFixture = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/streaming"));
        const migrated = await runMigration({
            pathToFixture
        });
        expect(await migrated.jsonify()).toMatchSnapshot();
    });
});
