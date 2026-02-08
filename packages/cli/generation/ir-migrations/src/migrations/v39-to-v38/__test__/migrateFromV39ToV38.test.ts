import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester.js";
import { V39_TO_V38_MIGRATION } from "../migrateFromV39ToV38.js";

const runMigration = createMigrationTester(V39_TO_V38_MIGRATION);

describe("migrateFromV39ToV38", () => {
    it("snapshot", async () => {
        const pathToFixture = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"));
        const migrated = await runMigration({
            pathToFixture
        });
        expect(await migrated.jsonify()).toMatchSnapshot();
    });
});
