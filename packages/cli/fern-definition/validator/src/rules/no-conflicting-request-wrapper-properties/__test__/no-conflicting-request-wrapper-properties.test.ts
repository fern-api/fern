import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoConflictingRequestWrapperPropertiesRule } from "../no-conflicting-request-wrapper-properties";

describe("no-conflicting-request-wrapper-properties", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoConflictingRequestWrapperPropertiesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                message: `Multiple request properties have the name foo. This is not suitable for code generation. Use the "name" property to deconflict.
  - Service header "foo"
  - Query Parameter "foo"`,
                nodePath: ["service", "endpoints", "c"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            },
            {
                message: `Multiple request properties have the name foo. This is not suitable for code generation. Use the "name" property to deconflict.
  - Service header "foo"
  - Body property: <Request Body> -> (extends) ObjectWithFoo -> foo`,
                nodePath: ["service", "endpoints", "d"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            },
            {
                message: `Multiple request properties have the name bar. This is not suitable for code generation. Use the "name" property to deconflict.
  - Service header "bar"
  - Body property: <Request Body> -> bar`,
                nodePath: ["service", "endpoints", "d"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            },
            {
                message: `Multiple request properties have the name baz. This is not suitable for code generation. Use the "name" property to deconflict.
  - Service header "baz"
  - Endpoint header "baz"`,
                nodePath: ["service", "endpoints", "d"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            },
            {
                message: `Multiple request properties have the name body. This is not suitable for code generation. Use the "name" property to deconflict.
  - Body property "body"
  - Query Parameter "body"`,
                nodePath: ["service", "endpoints", "c"],
                relativeFilepath: RelativeFilePath.of("body-property-key.yml"),
                severity: "error"
            }
        ]);
    });
});
