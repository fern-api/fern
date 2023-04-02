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
            ),
        });

        expect(violations).toEqual([
            {
                message: "list<string> is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "c"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error",
            },
            {
                message: "unknown is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "d"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error",
            },
            {
                message: "optional<AliasOfAliasOfObject> is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "g"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error",
            },
        ]);
    });
});
