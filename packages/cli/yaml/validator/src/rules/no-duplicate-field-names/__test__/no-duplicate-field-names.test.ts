import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoDuplicateFieldNamesRule } from "../no-duplicate-field-names";

describe("no-duplicate-field-names", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateFieldNamesRule,
            pathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            ),
        });

        expect(violations).toEqual([
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "ObjectWithDuplicateNames"],
                message: `Name "b" is used by multiple properties:
  - b
  - c`,
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "ObjectWithDuplicatedNameDirectAndByExtension"],
                message: `Name "blogPostName" is used by multiple properties:
  - blogPostName
  - blog.BlogPostAlias -> BlogPost -> blogPostName`,
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "ObjectWithDuplicatedNameFooByDifferentExtensions"],
                message: `Name "foo" is used by multiple properties:
  - ObjectWithFooProperty -> foo
  - ObjectWithFooAndBarProperties -> propertyWithFooName`,
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "EnumWithDuplicates"],
                message: 'Name "A" is used by multiple values.',
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "UnionWithOverlap"],
                message: `Discriminant "type" conflicts with extended property:
  - a -> ObjectWithTypeProperty -> type`,
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "UnionWithOverlapWithCustomName"],
                message: `Discriminant "foo" conflicts with extended properties:
  - a -> ObjectWithDuplicatedNameFooByDifferentExtensions -> ObjectWithFooProperty -> foo
  - a -> ObjectWithDuplicatedNameFooByDifferentExtensions -> ObjectWithFooAndBarProperties -> propertyWithFooName`,
            },
        ]);
    });
});
