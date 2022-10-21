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
                message: "Endpoint 'baz' is a GET request, so it cannot have a request body.",
                nodePath: ["services", "http", "MyService"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
            {
                message: "Endpoint 'bing' is a GET request, so it cannot have a request body.",
                nodePath: ["services", "http", "MyService"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
        ]);
    });
});
