import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoConflictingEndpointParametersRule } from "../no-conflicting-endpoint-parameters";

describe("no-conflicting-endpoint-parameters", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoConflictingEndpointParametersRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        expect(violations).toEqual([
            {
                message:
                    "Path parameter request is not suitable for code generation, because it can conflict with the request body parameter.",
                nodePath: ["services", "http", "Service", "path-parameters", "request"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
            {
                message:
                    "Path parameter request is not suitable for code generation, because it can conflict with the request body parameter.",
                nodePath: ["services", "http", "Service", "endpoints", "b", "path-parameters", "request"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
        ]);
    });
});
