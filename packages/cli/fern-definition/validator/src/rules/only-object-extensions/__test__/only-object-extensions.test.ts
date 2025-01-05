import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { ValidationViolation } from "../../../ValidationViolation";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { OnlyObjectExtensionsRule } from "../only-object-extensions";

describe("only-object-extensions", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: OnlyObjectExtensionsRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: "Objects can only extend other objects, and commons.CommonString is not an object.",
                nodePath: ["types", "MyObject", "extends", "commons.CommonString"],
                relativeFilepath: RelativeFilePath.of("types.yml"),
                severity: "error"
            },
            {
                message: "Objects can only extend other objects, and LocalString is not an object.",
                nodePath: ["types", "MyObject", "extends", "LocalString"],
                relativeFilepath: RelativeFilePath.of("types.yml"),
                severity: "error"
            },
            {
                message: "Objects can only extend other objects, and LocalString is not an object.",
                nodePath: ["service", "endpoints", "get", "request", "body", "extends", "LocalString"],
                relativeFilepath: RelativeFilePath.of("types.yml"),
                severity: "error"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
