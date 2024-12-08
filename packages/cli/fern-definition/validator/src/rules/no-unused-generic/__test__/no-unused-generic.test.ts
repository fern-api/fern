import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoUnusedGenericRule } from "../no-unused-generic";

describe("no-unused-generic", () => {
    it("simple", () => {
        const violations = getViolationsForRule({
            rule: NoUnusedGenericRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                message: 'Generic "AnotherGenericUnusedType<T>" is declared but never used.',
                nodePath: ["types", "AnotherGenericUnusedType<T>"],
                relativeFilepath: RelativeFilePath.of("1.yml"),
                severity: "error"
            },
            {
                message: 'Generic "GenericUnusedType<T>" is declared but never used.',
                nodePath: ["types", "GenericUnusedType<T>"],
                relativeFilepath: RelativeFilePath.of("2.yml"),
                severity: "error"
            }
        ]);
    });
});
