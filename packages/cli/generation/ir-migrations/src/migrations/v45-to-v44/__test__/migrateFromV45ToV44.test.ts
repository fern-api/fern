import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester.js";
import { V45_TO_V44_MIGRATION } from "../migrateFromV45ToV44.js";

const runMigration = createMigrationTester(V45_TO_V44_MIGRATION);

describe("migrateFromV45ToV44", () => {
    it("snapshot", async () => {
        const pathToFixture = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"));
        const migrated = await runMigration({
            pathToFixture
        });
        expect(await migrated.jsonify()).toMatchSnapshot();
    });
});
