import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V51_TO_V50_MIGRATION } from "../migrateFromV51ToV50";

const runMigration = createMigrationTester(V51_TO_V50_MIGRATION);

describe("migrateFromV51ToV50", () => {
    it("simple", async () => {
        const pathToFixture = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"));
        const migrated = await runMigration({
            pathToFixture
        });
        expect(await migrated.jsonify()).toMatchSnapshot();
    });
});
