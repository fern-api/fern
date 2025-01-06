import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoDuplicateFieldNamesRule } from "../no-duplicate-field-names";

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
                severity: "error",
                relativeFilepath: RelativeFilePath.of("1.yml"),
                nodePath: ["types", "ObjectWithDuplicateNames"],
                message: `Object has multiple properties named "b":
  - ObjectWithDuplicateNames -> b
  - ObjectWithDuplicateNames -> c`
            },
            {
                severity: "error",
                relativeFilepath: RelativeFilePath.of("1.yml"),
                nodePath: ["types", "ObjectWithDuplicatedNameDirectAndByExtension"],
                message: `Object has multiple properties named "blogPostName":
  - ObjectWithDuplicatedNameDirectAndByExtension -> blogPostName
  - ObjectWithDuplicatedNameDirectAndByExtension -> (extends) blog.BlogPostAlias -> (alias of) BlogPost -> blogPostName`
            },
            {
                severity: "error",
                relativeFilepath: RelativeFilePath.of("1.yml"),
                nodePath: ["types", "ObjectWithDuplicatedNameFooByDifferentExtensions"],
                message: `Object has multiple properties named "foo":
  - ObjectWithDuplicatedNameFooByDifferentExtensions -> (extends) ObjectWithFooProperty -> foo
  - ObjectWithDuplicatedNameFooByDifferentExtensions -> (extends) ObjectWithFooAndBarProperties -> propertyWithFooName`
            },
            {
                severity: "error",
                relativeFilepath: RelativeFilePath.of("1.yml"),
                nodePath: ["types", "EnumWithDuplicates"],
                message: 'Name "A" is used by multiple values.'
            },
            {
                severity: "error",
                relativeFilepath: RelativeFilePath.of("1.yml"),
                nodePath: ["types", "UnionWithOverlap"],
                message: `Discriminant "type" conflicts with extended property:
  - a -> ObjectWithTypeProperty -> type`
            },
            {
                severity: "error",
                relativeFilepath: RelativeFilePath.of("1.yml"),
                nodePath: ["types", "UnionWithOverlapWithCustomName"],
                message: `Discriminant "foo" conflicts with extended properties:
  - a -> ObjectWithDuplicatedNameFooByDifferentExtensions -> (extends) ObjectWithFooProperty -> foo
  - a -> ObjectWithDuplicatedNameFooByDifferentExtensions -> (extends) ObjectWithFooAndBarProperties -> propertyWithFooName`
            }
        ]);
    });
});
