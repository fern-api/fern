import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { createMigrationTester } from "../../../__test__/utils/runFixtureThroughMigration";
import { V10_TO_V9_MIGRATION } from "../migrateFromV10ToV9";

const runMigration = createMigrationTester(V10_TO_V9_MIGRATION);

describe("migrateFromV10ToV9", () => {
    it("add top-level docs to service", async () => {
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), "./fixtures/simple"),
        });
        expect(migrated.services["no-docs:service"]?.docs).toBeUndefined();
        expect(migrated.services["only-service-docs:service"]?.docs).toBe("service docs");
        expect(migrated.services["only-top-level-docs:service"]?.docs).toBe("top-level docs");
        expect(migrated.services["both-docs:service"]?.docs).toBe("top-level docs");
    });
});
