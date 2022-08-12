import { entries } from "@fern-api/core-utils";
import { loadWorkspace } from "@fern-api/workspace-loader";
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
        absolutePathToWorkspace: string;
    }
}

export async function getViolationsForRule({
    rule,
    absolutePathToWorkspace,
}: getViolationsForRule.Args): Promise<RuleViolation[]> {
    const parseResult = await loadWorkspace({
        absolutePathToWorkspace,
        version: 1,
    });
    if (!parseResult.didSucceed) {
        throw new Error("Failed to parse workspace: " + JSON.stringify(parseResult));
    }

    const ruleRunner = await rule.create({ workspace: parseResult.workspace });
    const violations: RuleViolation[] = [];

    for (const [relativeFilePath, contents] of entries(parseResult.workspace.serviceFiles)) {
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
