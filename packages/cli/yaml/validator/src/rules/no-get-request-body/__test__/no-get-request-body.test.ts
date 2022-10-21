import { AbsoluteFilePath, join } from "@fern-api/core-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoGetRequestBodyRule } from "../no-get-request-body";

describe("no-get-request-body", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoGetRequestBodyRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        expect(violations).toEqual([
            {
                message: "Endpoint is a GET, so it cannot have a request body.",
                nodePath: ["services", "http", "MyService", "endpoints", "baz"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
            {
                message: "Endpoint is a GET, so it cannot have a request body.",
                nodePath: ["services", "http", "MyService", "endpoints", "bing"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
        ]);
    });
});
