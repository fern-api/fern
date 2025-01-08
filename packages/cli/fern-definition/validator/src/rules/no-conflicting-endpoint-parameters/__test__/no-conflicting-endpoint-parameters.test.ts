import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoConflictingEndpointParametersRule } from "../no-conflicting-endpoint-parameters";

describe("no-conflicting-endpoint-parameters", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoConflictingEndpointParametersRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                message:
                    "Path parameter request is not suitable for code generation, because it can conflict with the request body parameter.",
                nodePath: ["service", "path-parameters", "request"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            },
            {
                message:
                    "Path parameter request is not suitable for code generation, because it can conflict with the request body parameter.",
                nodePath: ["service", "endpoints", "b", "path-parameters", "request"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            }
        ]);
    });
});
