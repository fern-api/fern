import { parseWorkspaceDefinition } from "@fern-api/workspace-parser";
import { visitFernYamlAst } from "@fern-api/yaml-schema";
import { createAstVisitorForRules } from "../createAstVisitorForRules";
import { Rule, RuleViolation } from "../Rule";

export declare namespace getViolationsForRule {
    export interface Args {
        rule: Rule;
        absolutePathToDefinition: string;
    }
}

export async function getViolationsForRule({
    rule,
    absolutePathToDefinition,
}: getViolationsForRule.Args): Promise<RuleViolation[]> {
    const parseResult = await parseWorkspaceDefinition({
        name: undefined,
        absolutePathToDefinition,
    });
    if (!parseResult.didSucceed) {
        throw new Error("Failed to parse workspace");
    }

    const ruleRunner = await rule.create({ workspace: parseResult.workspace });
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
        await visitFernYamlAst(contents, visitor);
    }

    return violations;
}
