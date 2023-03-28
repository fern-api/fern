import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoUndefinedPathParametersRule } from "../no-undefined-path-parameters";

describe("no-undefined-path-parameters", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoUndefinedPathParametersRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        expect(violations).toEqual([
            {
                message: "File has missing path-parameter: bar.",
                nodePath: [],
                relativeFilepath: "api.yml",
                severity: "error",
            },
            {
                message: "Service has missing path-parameter: baseParameter.",
                nodePath: ["service"],
                relativeFilepath: "simple.yml",
                severity: "error",
            },
            {
                message: "Path parameter is unreferenced in service: fakeBaseParameter.",
                nodePath: ["service"],
                relativeFilepath: "simple.yml",
                severity: "error",
            },
            {
                message: "Endpoint has missing path-parameter: parameter2.",
                nodePath: ["service", "endpoints", "missingPathParameters"],
                relativeFilepath: "simple.yml",
                severity: "error",
            },
            {
                message: "Path parameter is unreferenced in endpoint: parameter1.",
                nodePath: ["service", "endpoints", "unusedPathParameters"],
                relativeFilepath: "simple.yml",
                severity: "error",
            },
        ]);
    });
});
