import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoComplexQueryParamsRule } from "../no-complex-query-params";

describe("no-complex-query-params", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoComplexQueryParamsRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                message: "Union is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "o"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "fatal"
            },
            {
                message: "UndiscriminatedUnion is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "p"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "fatal"
            },
            {
                message: "ObjectWithUnion is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "q"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "fatal"
            },
            {
                message: "NestedObjectWithUnion is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "r"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "fatal"
            }
        ]);
    });
});
