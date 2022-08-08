import path from "path";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoDuplicateDeclarationsRule } from "../no-duplicate-declarations";

describe("no-duplicate-declarations", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateDeclarationsRule,
            absolutePathToDefinition: path.join(__dirname, "fixtures", "simple"),
        });

        expect(violations).toMatchObject([
            {
                message: "C is already declared in this file",
                nodePath: ["ids", "C"],
                relativeFilePath: "src/1.yml",
                severity: "error",
            },
            {
                message: "TwoService is already declared in src/2.yml",
                nodePath: ["types", "TwoService"],
                relativeFilePath: "src/1.yml",
                severity: "error",
            },
            {
                message: "OneService is already declared in src/2.yml",
                nodePath: ["services", "http", "OneService"],
                relativeFilePath: "src/1.yml",
                severity: "error",
            },
            {
                message: "C is already declared in this file",
                nodePath: ["errors", "C"],
                relativeFilePath: "src/1.yml",
                severity: "error",
            },
            {
                message: "OneService is already declared in src/1.yml",
                nodePath: ["services", "http", "OneService"],
                relativeFilePath: "src/2.yml",
                severity: "error",
            },
            {
                message: "TwoService is already declared in src/1.yml",
                nodePath: ["services", "http", "TwoService"],
            },
        ]);
    });
});
