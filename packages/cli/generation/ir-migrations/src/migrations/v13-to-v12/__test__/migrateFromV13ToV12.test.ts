import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V13_TO_V12_MIGRATION } from "../migrateFromV13ToV12";

const runMigration = createMigrationTester(V13_TO_V12_MIGRATION);

describe("migrateFromV13ToV12", () => {
    it("migrates header", async () => {
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"))
        });

        const firstScheme = migrated.ir.auth.schemes[0];
        if (firstScheme?._type !== "header") {
            throw new Error("First scheme is not a header");
        }
        expect(firstScheme.header).toBe("X-Api-Key");
    });
});
