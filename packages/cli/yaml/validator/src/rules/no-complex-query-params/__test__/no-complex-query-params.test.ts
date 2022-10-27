import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoComplexQueryParamsRule } from "../no-complex-query-params";

describe("no-complex-query-params", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoComplexQueryParamsRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        expect(violations).toEqual([
            {
                message: "list<string> is not a valid type for a query parameter",
                nodePath: ["services", "http", "MyService", "endpoints", "bar", "query-parameters", "c"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
            {
                message: "unknown is not a valid type for a query parameter",
                nodePath: ["services", "http", "MyService", "endpoints", "bar", "query-parameters", "d"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
            {
                message: "optional<AliasOfAliasOfObject> is not a valid type for a query parameter",
                nodePath: ["services", "http", "MyService", "endpoints", "bar", "query-parameters", "g"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
        ]);
    });
});
