import { entries } from "@fern-api/core-utils";
import { parseWorkspaceDefinition } from "@fern-api/workspace-parser";
import { visitFernYamlAst } from "@fern-api/yaml-schema";
import { createAstVisitorForRules } from "../createAstVisitorForRules";
import { Rule, RuleViolation } from "../Rule";

const CHALK_ESCAPE_SEQUENCES = [
    // bold:open
    "\x1B\\[1m",
    // bold:close
    "\x1B\\[22m",
];

const CHALK_ESCAPE_SEQUENCES_REGEX = new RegExp(`${CHALK_ESCAPE_SEQUENCES.join("|")}`, "g");

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

    for (const [relativeFilePath, contents] of entries(parseResult.workspace.files)) {
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

    return violations.map((violation) => ({
        ...violation,
        message: violation.message.replaceAll(CHALK_ESCAPE_SEQUENCES_REGEX, ""),
    }));
}
