import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { NoDuplicateFieldNamesRule } from "../no-duplicate-field-names.js";

describe("no-duplicate-field-names", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateFieldNamesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                name: "no-duplicate-field-names",
                severity: "fatal",
                relativeFilepath: RelativeFilePath.of("1.yml"),
                nodePath: ["types", "ObjectWithDuplicateNames"],
                message: `Object has multiple properties named "b":
  - ObjectWithDuplicateNames -> b
  - ObjectWithDuplicateNames -> c`
            },
            {
                name: "no-duplicate-field-names",
                severity: "fatal",
                relativeFilepath: RelativeFilePath.of("1.yml"),
                nodePath: ["types", "ObjectWithDuplicatedNameDirectAndByExtension"],
                message: `Object has multiple properties named "blogPostName":
  - ObjectWithDuplicatedNameDirectAndByExtension -> blogPostName
  - ObjectWithDuplicatedNameDirectAndByExtension -> (extends) blog.BlogPostAlias -> (alias of) BlogPost -> blogPostName`
            },
            {
                name: "no-duplicate-field-names",
                severity: "fatal",
                relativeFilepath: RelativeFilePath.of("1.yml"),
                nodePath: ["types", "ObjectWithDuplicatedNameFooByDifferentExtensions"],
                message: `Object has multiple properties named "foo":
  - ObjectWithDuplicatedNameFooByDifferentExtensions -> (extends) ObjectWithFooProperty -> foo
  - ObjectWithDuplicatedNameFooByDifferentExtensions -> (extends) ObjectWithFooAndBarProperties -> propertyWithFooName`
            },
            {
                name: "no-duplicate-field-names",
                severity: "fatal",
                relativeFilepath: RelativeFilePath.of("1.yml"),
                nodePath: ["types", "EnumWithDuplicates"],
                message: 'Name "A" is used by multiple values.'
            }
        ]);
    });
});
