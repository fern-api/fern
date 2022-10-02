import { AbsoluteFilePath, join } from "@fern-api/core-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoDuplicateDeclarationsRule } from "../no-duplicate-declarations";

describe("no-duplicate-declarations", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateDeclarationsRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        expect(violations).toEqual([
            {
                message: "C is already declared in this file",
                nodePath: ["ids", "C"],
                relativeFilepath: "1.yml",
                severity: "error",
            },
            {
                message: "TwoService is already declared in 2.yml",
                nodePath: ["types", "TwoService"],
                relativeFilepath: "1.yml",
                severity: "error",
            },
            {
                message: "OneService is already declared in 2.yml",
                nodePath: ["services", "http", "OneService"],
                relativeFilepath: "1.yml",
                severity: "error",
            },
            {
                message: "C is already declared in this file",
                nodePath: ["errors", "C"],
                relativeFilepath: "1.yml",
                severity: "error",
            },
            {
                message: "OneService is already declared in 1.yml",
                nodePath: ["services", "http", "OneService"],
                relativeFilepath: "2.yml",
                severity: "error",
            },
            {
                message: "TwoService is already declared in 1.yml",
                nodePath: ["services", "http", "TwoService"],
                relativeFilepath: "2.yml",
                severity: "error",
            },
        ]);
    });
});
