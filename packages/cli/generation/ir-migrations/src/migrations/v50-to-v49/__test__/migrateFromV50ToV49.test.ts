import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V50_TO_V49_MIGRATION } from "../migrateFromV50ToV49";

const runMigration = createMigrationTester(V50_TO_V49_MIGRATION);

describe("migrateFromV50ToV49", () => {
    it("simple", async () => {
        const pathToFixture = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"));
        const migrated = await runMigration({
            pathToFixture
        });
        expect(await migrated.jsonify()).toMatchSnapshot();
    });
});
