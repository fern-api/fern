import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V9_TO_V8_MIGRATION } from "../migrateFromV9ToV8";

const runMigration = createMigrationTester(V9_TO_V8_MIGRATION);

describe("migrateFromV9ToV8", () => {
    it("migrates maps to list", async () => {
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"))
        });
        expect(await migrated.jsonify()).toMatchSnapshot();
    });
});
