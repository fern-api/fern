import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoUndefinedPathParametersRule } from "../no-undefined-path-parameters";

describe("no-undefined-path-parameters", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoUndefinedPathParametersRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                message: "File has missing path-parameter: bar.",
                nodePath: [],
                relativeFilepath: RelativeFilePath.of("api.yml"),
                severity: "error"
            },
            {
                message: "Service has missing path-parameter: baseParameter.",
                nodePath: ["service"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message: "Path parameter is unreferenced in service: fakeBaseParameter.",
                nodePath: ["service"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message: "Endpoint has missing path-parameter: parameter2.",
                nodePath: ["service", "endpoints", "missingPathParameters"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message: "Path parameter is unreferenced in endpoint: parameter1.",
                nodePath: ["service", "endpoints", "unusedPathParameters"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            }
        ]);
    });
});
