import { IrVersions } from "../../../ir-versions";
import { MOCK_IR_V2 } from "../../../__test__/mocks/irV2";
import { V2_TO_V1_MIGRATION } from "../migrateFromV2ToV1";

describe("migrateFromV2ToV1", () => {
    it("adds discriminantValue to errors", () => {
        const migrated = V2_TO_V1_MIGRATION.migrateBackwards(
            MOCK_IR_V2 as unknown as IrVersions.V2.ir.IntermediateRepresentation
        );
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
