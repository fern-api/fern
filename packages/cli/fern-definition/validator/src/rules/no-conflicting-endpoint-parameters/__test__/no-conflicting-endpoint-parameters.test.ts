import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

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
                    "The path parameter name request is reserved and conflicts with the request body parameter used in generated code. Please rename this path parameter to avoid the conflict (e.g., 'request_id', 'request_identifier', or 'req_id').",
                nodePath: ["service", "path-parameters", "request"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "fatal"
            },
            {
                message:
                    "The path parameter name request is reserved and conflicts with the request body parameter used in generated code. Please rename this path parameter to avoid the conflict (e.g., 'request_id', 'request_identifier', or 'req_id').",
                nodePath: ["service", "endpoints", "b", "path-parameters", "request"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "fatal"
            }
        ]);
    });
});
