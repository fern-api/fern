import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { ValidationViolation } from "../../../ValidationViolation";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoConflictingEndpointPathsRule } from "../no-conflicting-endpoint-paths";

describe("no-conflicting-endpoint-paths", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoConflictingEndpointPathsRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: `Endpoint path /a/foo conflicts with other endpoints:
  - b.yml -> foo /{pathParam}/foo`,
                nodePath: ["service", "endpoints", "foo"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "warning"
            },
            {
                message: `Endpoint path /a/bar conflicts with other endpoints:
  - b.yml -> bar /{pathParam}/bar`,
                nodePath: ["service", "endpoints", "bar"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "warning"
            },
            {
                message: `Endpoint path /{pathParam}/foo conflicts with other endpoints:
  - a.yml -> foo /a/foo
  - c.yml -> foo /c/foo
  - c.yml -> bar /c/{pathParam}`,
                nodePath: ["service", "endpoints", "foo"],
                relativeFilepath: RelativeFilePath.of("b.yml"),
                severity: "warning"
            },
            {
                message: `Endpoint path /{pathParam}/bar conflicts with other endpoints:
  - a.yml -> bar /a/bar
  - c.yml -> bar /c/{pathParam}`,
                nodePath: ["service", "endpoints", "bar"],
                relativeFilepath: RelativeFilePath.of("b.yml"),
                severity: "warning"
            },
            {
                message: `Endpoint path /c/foo conflicts with other endpoints:
  - c.yml -> bar /c/{pathParam}
  - b.yml -> foo /{pathParam}/foo`,
                nodePath: ["service", "endpoints", "foo"],
                relativeFilepath: RelativeFilePath.of("c.yml"),
                severity: "warning"
            },
            {
                message: `Endpoint path /c/{pathParam} conflicts with other endpoints:
  - c.yml -> foo /c/foo
  - b.yml -> foo /{pathParam}/foo
  - b.yml -> bar /{pathParam}/bar`,
                nodePath: ["service", "endpoints", "bar"],
                relativeFilepath: RelativeFilePath.of("c.yml"),
                severity: "warning"
            },
            {
                message: `Endpoint path / conflicts with other endpoints:
  - d.yml -> bar /`,
                nodePath: ["service", "endpoints", "foo"],
                relativeFilepath: RelativeFilePath.of("d.yml"),
                severity: "warning"
            },
            {
                message: `Endpoint path / conflicts with other endpoints:
  - d.yml -> foo /`,
                nodePath: ["service", "endpoints", "bar"],
                relativeFilepath: RelativeFilePath.of("d.yml"),
                severity: "warning"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
