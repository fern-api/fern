import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoUndefinedExampleReferenceRule } from "../no-undefined-example-reference";

describe("no-undefined-example-reference", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoUndefinedExampleReferenceRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        // Note: $malformed-example is now treated as a literal string (not an example reference)
        // because it doesn't match the valid example reference format ($Type.Example or $import.Type.Example).
        // This is intentional - strings like "$PATH", "$USD", "$3.00" should not require escaping.
        expect(violations).toEqual([
            {
                message: "Example $a.MissingType.Example is not defined.",
                nodePath: [
                    "types",
                    "MyType",
                    {
                        arrayIndex: 0,
                        key: "examples"
                    }
                ],
                relativeFilepath: RelativeFilePath.of("b.yml"),
                severity: "fatal"
            },
            {
                message: "Example $other.OtherType.OtherExample2 is not defined.",
                nodePath: [
                    "types",
                    "NestedType",
                    {
                        arrayIndex: 0,
                        key: "examples"
                    }
                ],
                relativeFilepath: RelativeFilePath.of("folder/nested.yml"),
                severity: "fatal"
            }
        ]);
    });
});
