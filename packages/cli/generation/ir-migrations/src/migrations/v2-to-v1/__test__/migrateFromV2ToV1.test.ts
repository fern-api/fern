import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V2_TO_V1_MIGRATION } from "../migrateFromV2ToV1";

const runMigration = createMigrationTester(V2_TO_V1_MIGRATION);

describe("migrateFromV2ToV1", () => {
    it("adds discriminantValue to errors", async () => {
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"))
        });
        expect(migrated.ir.errors[0]?.discriminantValue).toEqual({
            camelCase: "blogNotFoundError",
            originalValue: "BlogNotFoundError",
            pascalCase: "BlogNotFoundError",
            screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
            snakeCase: "blog_not_found_error",
            wireValue: "BlogNotFoundError"
        });
        expect(migrated.ir.services.http[0]?.name.name).toBe("BlogService");
    });
});
