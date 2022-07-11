import { parseWorkspaceDefinition } from "@fern-api/workspace-parser";
import { visitFernYamlAst } from "@fern-api/yaml-schema";
import path from "path";
import { createAstVisitorForRules } from "../../../createAstVisitorForRules";
import { RuleViolation } from "../../../Rule";
import { NoUndefinedTypeReferenceRule } from "../no-undefined-type-reference";

describe("no-undefined-type-reference", () => {
    it("simple", async () => {
        const parseResult = await parseWorkspaceDefinition({
            name: "Simple Model",
            absolutePathToDefinition: path.join(__dirname, "fixtures", "simple.yml"),
        });
        if (!parseResult.didSucceed) {
            throw new Error("Failed to parse workspace");
        }

        const ruleRunner = NoUndefinedTypeReferenceRule.create({ workspace: parseResult.workspace });
        const violations: RuleViolation[] = [];

        for (const [relativeFilePath, contents] of Object.entries(parseResult.workspace.files)) {
            const visitor = createAstVisitorForRules({
                relativeFilePath,
                contents,
                ruleRunners: [ruleRunner],
                addViolations: (newViolations) => {
                    violations.push(...newViolations);
                },
            });
            visitFernYamlAst(contents, visitor);
        }

        expect(violations).toMatchObject([
            {
                message: /Type .*MissingType.* is not defined/,
                nodePath: ["types", "MyType"],
                relativeFilePath: "simple.yml",
                severity: "error",
            },
        ]);
    });
});
