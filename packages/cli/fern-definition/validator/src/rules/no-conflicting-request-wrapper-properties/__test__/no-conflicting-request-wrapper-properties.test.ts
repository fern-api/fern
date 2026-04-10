import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { NoConflictingRequestWrapperPropertiesRule } from "../no-conflicting-request-wrapper-properties.js";

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
                name: "no-conflicting-request-wrapper-properties",
                severity: "fatal"
            },
            {
                message: `Multiple request properties have the name foo. This is not suitable for code generation. Use the "name" property to deconflict.
  - Service header "foo"
  - Body property: <Request Body> -> (extends) ObjectWithFoo -> foo`,
                nodePath: ["service", "endpoints", "d"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                name: "no-conflicting-request-wrapper-properties",
                severity: "fatal"
            },
            {
                message: `Multiple request properties have the name bar. This is not suitable for code generation. Use the "name" property to deconflict.
  - Service header "bar"
  - Body property: <Request Body> -> bar`,
                nodePath: ["service", "endpoints", "d"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                name: "no-conflicting-request-wrapper-properties",
                severity: "fatal"
            },
            {
                message: `Multiple request properties have the name baz. This is not suitable for code generation. Use the "name" property to deconflict.
  - Service header "baz"
  - Endpoint header "baz"`,
                nodePath: ["service", "endpoints", "d"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                name: "no-conflicting-request-wrapper-properties",
                severity: "fatal"
            },
            {
                message: `Multiple request properties have the name body. This is not suitable for code generation. Use the "name" property to deconflict.
  - Body property "body"
  - Query Parameter "body"`,
                nodePath: ["service", "endpoints", "c"],
                relativeFilepath: RelativeFilePath.of("body-property-key.yml"),
                name: "no-conflicting-request-wrapper-properties",
                severity: "fatal"
            },
            {
                message: `Multiple request properties resolve to the same generated name organizationId after camelCase normalization. This causes broken generated code. Use the "name" property to disambiguate.
  - Service header "Organization-Id" (name: "organizationId")
  - Query Parameter "organization_id" (name: "organization_id")`,
                nodePath: ["service", "endpoints", "list"],
                relativeFilepath: RelativeFilePath.of("camel-case-collision.yml"),
                name: "no-conflicting-request-wrapper-properties",
                severity: "fatal"
            }
        ]);
    });
});
