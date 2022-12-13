import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoMissingRequestNameRule } from "../no-missing-request-name";

describe("no-get-request-body", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoMissingRequestNameRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        expect(violations).toEqual([
            {
                message: "Request name is required because request body is defined inline",
                nodePath: ["services", "http", "ServiceWithoutNames", "endpoints", "baz"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
            {
                message: "Request name is required because request has query parameters",
                nodePath: ["services", "http", "ServiceWithoutNames", "endpoints", "bing"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
            {
                message: "Request name is required because request has headers",
                nodePath: ["services", "http", "ServiceWithoutNames", "endpoints", "bat"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
            {
                message: "Request name is required because service has headers",
                nodePath: ["services", "http", "ServiceWithHeaders", "endpoints", "get"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
        ]);
    });
});
