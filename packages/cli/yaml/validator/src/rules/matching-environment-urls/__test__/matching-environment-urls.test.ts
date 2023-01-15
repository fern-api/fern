import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { MatchingEnvironmentUrlsRule } from "../matching-environment-urls";

describe("matching-environment-urls", () => {
    it("matching-urls", async () => {
        const violations = await getViolationsForRule({
            rule: MatchingEnvironmentUrlsRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "matching-urls"),
        });
        expect(violations).toEqual([]);
    });

    it("not-matching-urls", async () => {
        const violations = await getViolationsForRule({
            rule: MatchingEnvironmentUrlsRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "not-matching-urls"),
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: "Environment SingleUrl is missing URL for A",
                nodePath: ["environments", "SingleUrl"],
                relativeFilepath: "api.yml",
                severity: "error",
            },
            {
                message: "Environment SingleUrl is missing URL for B",
                nodePath: ["environments", "SingleUrl"],
                relativeFilepath: "api.yml",
                severity: "error",
            },
            {
                message: "Environment SingleUrl is missing URL for C",
                nodePath: ["environments", "SingleUrl"],
                relativeFilepath: "api.yml",
                severity: "error",
            },
            {
                message: "Environment Staging is missing URL for C",
                nodePath: ["environments", "Staging"],
                relativeFilepath: "api.yml",
                severity: "error",
            },
            {
                message: "Environment Production is missing URL for A",
                nodePath: ["environments", "Production"],
                relativeFilepath: "api.yml",
                severity: "error",
            },
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
