import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

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
                message: "unknown is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "d"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            },
            {
                message: "ObjectWithLiteral is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "l"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            },
            {
                message: "NestedObjectWithLiteral is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "n"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            },
            {
                message: "Union is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "o"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            },
            {
                message: "UndiscriminatedUnion is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "p"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            },
            {
                message: "ObjectWithUnion is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "q"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            },
            {
                message: "NestedObjectWithUnion is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "r"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            },
            {
                message: "map<string, ObjectWithLiteral> is not a valid type for a query parameter",
                nodePath: ["service", "endpoints", "bar", "request", "query-parameters", "u"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            }
        ]);
    });
});
