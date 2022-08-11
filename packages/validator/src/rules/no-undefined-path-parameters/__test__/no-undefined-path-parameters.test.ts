import path from "path";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoUndefinedPathParametersRule } from "../no-undefined-path-parameters";

describe("no-undefined-path-parameters", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoUndefinedPathParametersRule,
            absolutePathToWorkspace: path.join(__dirname, "fixtures", "simple"),
        });

        expect(violations).toMatchObject([
            {
                message: "Endpoint is missing path-parameter: parameter2.",
                nodePath: ["services", "http", "SimpleService", "endpoints", "missingPathParameters"],
                relativeFilePath: "simple.yml",
                severity: "error",
            },
            {
                message: "Endpoint path has unused path-parameter: parameter1.",
                nodePath: ["services", "http", "SimpleService", "endpoints", "unusedPathParameters"],
                relativeFilePath: "simple.yml",
                severity: "error",
            },
        ]);
    });
});
