import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoMissingErrorDiscriminantRule } from "../no-missing-error-discriminant";

describe("no-missing-error-discriminant", () => {
    it("discriminant-missing-errors-declared", async () => {
        const violations = await getViolationsForRule({
            rule: NoMissingErrorDiscriminantRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                "fixtures",
                "discriminant-missing-errors-declared"
            ),
        });
        expect(violations).toEqual([
            {
                message: "error-discrimination is required because this API has declared errors.",
                nodePath: ["error-discrimination"],
                relativeFilepath: "api.yml",
                severity: "error",
            },
        ]);
    });

    it("discriminant-missing-no-errors-declared", async () => {
        const violations = await getViolationsForRule({
            rule: NoMissingErrorDiscriminantRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                "fixtures",
                "discriminant-missing-no-errors-declared"
            ),
        });
        expect(violations).toEqual([]);
    });

    it("discriminant-present-errors-declared", async () => {
        const violations = await getViolationsForRule({
            rule: NoMissingErrorDiscriminantRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                "fixtures",
                "discriminant-present-errors-declared"
            ),
        });
        expect(violations).toEqual([]);
    });

    it("discriminant-present-no-errors-declared", async () => {
        const violations = await getViolationsForRule({
            rule: NoMissingErrorDiscriminantRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                "fixtures",
                "discriminant-present-no-errors-declared"
            ),
        });
        expect(violations).toEqual([]);
    });
});
