import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoMissingRequestNameRule } from "../no-missing-request-name";

describe("no-missing-request-name", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoMissingRequestNameRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                message: "Request name is required because service has headers",
                nodePath: ["service", "endpoints", "get"],
                relativeFilepath: RelativeFilePath.of("service-with-headers.yml"),
                severity: "error"
            },
            {
                message: "Request name is required because request body is defined inline",
                nodePath: ["service", "endpoints", "baz"],
                relativeFilepath: RelativeFilePath.of("service-without-names.yml"),
                severity: "error"
            },

            {
                message: "Request name is required because request has query parameters",
                nodePath: ["service", "endpoints", "bing"],
                relativeFilepath: RelativeFilePath.of("service-without-names.yml"),
                severity: "error"
            },
            {
                message: "Request name is required because request has headers",
                nodePath: ["service", "endpoints", "bat"],
                relativeFilepath: RelativeFilePath.of("service-without-names.yml"),
                severity: "error"
            }
        ]);
    });
});
