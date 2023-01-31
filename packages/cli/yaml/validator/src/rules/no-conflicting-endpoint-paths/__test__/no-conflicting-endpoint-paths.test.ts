import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { NoConflictingEndpointPathsRule } from "../no-conflicting-endpoint-paths";

describe("no-conflicting-endpoint-paths", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoConflictingEndpointPathsRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: `Endpoint path /a/foo conflicts with other endpoints:
  - b.yml -> foo /{pathParam}/foo`,
                nodePath: ["service", "endpoints", "foo"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
            {
                message: `Endpoint path /a/bar conflicts with other endpoints:
  - b.yml -> bar /{pathParam}/bar`,
                nodePath: ["service", "endpoints", "bar"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
            {
                message: `Endpoint path /{pathParam}/foo conflicts with other endpoints:
  - a.yml -> foo /a/foo
  - c.yml -> foo /c/foo
  - c.yml -> bar /c/{pathParam}`,
                nodePath: ["service", "endpoints", "foo"],
                relativeFilepath: "b.yml",
                severity: "error",
            },
            {
                message: `Endpoint path /{pathParam}/bar conflicts with other endpoints:
  - a.yml -> bar /a/bar
  - c.yml -> bar /c/{pathParam}`,
                nodePath: ["service", "endpoints", "bar"],
                relativeFilepath: "b.yml",
                severity: "error",
            },
            {
                message: `Endpoint path /c/foo conflicts with other endpoints:
  - c.yml -> bar /c/{pathParam}
  - b.yml -> foo /{pathParam}/foo`,
                nodePath: ["service", "endpoints", "foo"],
                relativeFilepath: "c.yml",
                severity: "error",
            },
            {
                message: `Endpoint path /c/{pathParam} conflicts with other endpoints:
  - c.yml -> foo /c/foo
  - b.yml -> foo /{pathParam}/foo
  - b.yml -> bar /{pathParam}/bar`,
                nodePath: ["service", "endpoints", "bar"],
                relativeFilepath: "c.yml",
                severity: "error",
            },
            {
                message: `Endpoint path / conflicts with other endpoints:
  - d.yml -> bar /`,
                nodePath: ["service", "endpoints", "foo"],
                relativeFilepath: "d.yml",
                severity: "error",
            },
            {
                message: `Endpoint path / conflicts with other endpoints:
  - d.yml -> foo /`,
                nodePath: ["service", "endpoints", "bar"],
                relativeFilepath: "d.yml",
                severity: "error",
            },
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
