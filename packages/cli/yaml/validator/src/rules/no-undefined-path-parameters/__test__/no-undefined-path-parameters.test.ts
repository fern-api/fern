import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
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
            ),
        });

        expect(violations).toMatchObject([
            {
                message: "Service has missing path-parameter: baseParameter.",
                nodePath: ["services", "http", "SimpleService"],
                relativeFilePath: "simple.yml",
                severity: "error",
            },
            {
                message: "Path parameter is unreferenced in service: fakeBaseParameter.",
                nodePath: ["services", "http", "SimpleService"],
                relativeFilePath: "simple.yml",
                severity: "error",
            },
            {
                message: "Endpoint has missing path-parameter: parameter2.",
                nodePath: ["services", "http", "SimpleService", "endpoints", "missingPathParameters"],
                relativeFilePath: "simple.yml",
                severity: "error",
            },
            {
                message: "Path parameter is unreferenced in endpoint: parameter1.",
                nodePath: ["services", "http", "SimpleService", "endpoints", "unusedPathParameters"],
                relativeFilePath: "simple.yml",
                severity: "error",
            },
        ]);
    });
});
