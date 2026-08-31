import { NodePath } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    DocsConfigFileAstNodeTypes,
    DocsConfigFileAstNodeVisitor,
    DocsConfigFileAstVisitor
} from "./docsAst/DocsConfigFileAstVisitor.js";
import { formatInitError } from "./formatInitError.js";
import { RuleViolation, RuleVisitor } from "./Rule.js";
import { ValidationViolation } from "./ValidationViolation.js";

export interface RuleWithVisitor {
    ruleName: string;
    visitor: RuleVisitor<DocsConfigFileAstNodeTypes>;
}

export type SeverityOverride = "warning" | "error";

export function createDocsConfigFileAstVisitorForRules({
    relativeFilepath,
    allRulesWithVisitors,
    severityOverrides,
    addViolations
}: {
    relativeFilepath: RelativeFilePath;
    allRulesWithVisitors: RuleWithVisitor[];
    severityOverrides?: Map<string, SeverityOverride>;
    addViolations: (newViolations: ValidationViolation[]) => void;
}): DocsConfigFileAstVisitor {
    function createAstNodeVisitor<K extends keyof DocsConfigFileAstNodeTypes>(
        nodeType: K
    ): Record<K, DocsConfigFileAstNodeVisitor<K>> {
        const visit: DocsConfigFileAstNodeVisitor<K> = async (
            node: DocsConfigFileAstNodeTypes[K],
            nodePath: NodePath
        ) => {
            for (const { ruleName, visitor } of allRulesWithVisitors) {
                const visitFromRule = visitor[nodeType];
                if (visitFromRule != null) {
                    const severityOverride = severityOverrides?.get(ruleName);
                    let ruleViolations: RuleViolation[];
                    try {
                        ruleViolations = await visitFromRule(node);
                    } catch (error) {
                        // A rule that blows up mid-visit shouldn't take the rest of validation down
                        // with it: report it like any other violation, honoring the configured
                        // severity so `warn` keeps `fern check` green.
                        addViolations([
                            {
                                name: ruleName,
                                severity: severityOverride ?? "fatal",
                                relativeFilepath: RelativeFilePath.of(""),
                                nodePath,
                                message: `Rule "${ruleName}" failed to run: ${formatInitError(error)}`
                            }
                        ]);
                        continue;
                    }
                    addViolations(
                        ruleViolations.map((violation) => ({
                            name: violation.name ?? ruleName,
                            severity: severityOverride ?? violation.severity,
                            relativeFilepath: violation.relativeFilepath ?? RelativeFilePath.of(""),
                            nodePath: violation.nodePath ?? nodePath,
                            message: violation.message
                        }))
                    );
                }
            }
        };

        return { [nodeType]: visit } as Record<K, DocsConfigFileAstNodeVisitor<K>>;
    }

    return {
        ...createAstNodeVisitor("file"),
        ...createAstNodeVisitor("filepath"),
        ...createAstNodeVisitor("markdownPage"),
        ...createAstNodeVisitor("version"),
        ...createAstNodeVisitor("versionFile"),
        ...createAstNodeVisitor("apiSection"),
        ...createAstNodeVisitor("permissions"),
        ...createAstNodeVisitor("productFile")
    };
}
