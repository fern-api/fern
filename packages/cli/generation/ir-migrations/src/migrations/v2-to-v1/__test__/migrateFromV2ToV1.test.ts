import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getIntermediateRepresentationMigrator } from "../../../IntermediateRepresentationMigrator";
import { getIrForApi } from "../../../__test__/utils/getIrForApi";
import { V2_TO_V1_MIGRATION } from "../migrateFromV2ToV1";

describe("migrateFromV2ToV1", () => {
    it("adds discriminantValue to errors", async () => {
        const migrated = getIntermediateRepresentationMigrator().migrateThroughMigration({
            migration: V2_TO_V1_MIGRATION,
            intermediateRepresentation: await getIrForApi(join(AbsoluteFilePath.of(__dirname), "./fixtures/simple")),
        });
        expect(migrated.errors[0]?.discriminantValue).toEqual({
            camelCase: "blogNotFoundError",
            originalValue: "BlogNotFoundError",
            pascalCase: "BlogNotFoundError",
            screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
            snakeCase: "blog_not_found_error",
            wireValue: "BlogNotFoundError",
        });
    });
});
