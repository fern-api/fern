import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V59_TO_V58_MIGRATION } from "../migrateFromV59ToV58";

const runMigration = createMigrationTester(V59_TO_V58_MIGRATION);

describe("migrateFromV59ToV58", () => {
    it("inferred-auth-explicit", async () => {
        const pathToFixture = join(
            AbsoluteFilePath.of(__dirname),
            RelativeFilePath.of("./fixtures/inferred-auth-explicit")
        );
        const migrated = await runMigration({
            pathToFixture
        });
        expect(await migrated.jsonify()).toMatchSnapshot();
    });
    it("inferred-auth-implicit", async () => {
        const pathToFixture = join(
            AbsoluteFilePath.of(__dirname),
            RelativeFilePath.of("./fixtures/inferred-auth-implicit")
        );
        const migrated = await runMigration({
            pathToFixture
        });
        expect(await migrated.jsonify()).toMatchSnapshot();
    });
});
