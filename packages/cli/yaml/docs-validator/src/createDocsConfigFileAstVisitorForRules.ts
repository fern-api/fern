import { NodePath } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    DocsConfigFileAstNodeTypes,
    DocsConfigFileAstNodeVisitor,
    DocsConfigFileAstVisitor
} from "./docsAst/DocsConfigFileAstVisitor.js";
import { RuleVisitor } from "./Rule.js";
import { ValidationViolation } from "./ValidationViolation.js";

export function createDocsConfigFileAstVisitorForRules({
    relativeFilepath,
    allRuleVisitors,
    ruleNames,
    addViolations
}: {
    relativeFilepath: RelativeFilePath;
    allRuleVisitors: RuleVisitor<DocsConfigFileAstNodeTypes>[];
    ruleNames: string[];
    addViolations: (newViolations: ValidationViolation[]) => void;
}): DocsConfigFileAstVisitor {
    function createAstNodeVisitor<K extends keyof DocsConfigFileAstNodeTypes>(
        nodeType: K
    ): Record<K, DocsConfigFileAstNodeVisitor<K>> {
        const visit: DocsConfigFileAstNodeVisitor<K> = async (
            node: DocsConfigFileAstNodeTypes[K],
            nodePath: NodePath
        ) => {
            for (let i = 0; i < allRuleVisitors.length; i++) {
                const ruleVisitors = allRuleVisitors[i];
                const ruleName = ruleNames[i];
                const visitFromRule = ruleVisitors?.[nodeType];
                if (visitFromRule != null) {
                    const ruleViolations = await visitFromRule(node);
                    addViolations(
                        ruleViolations.map((violation) => ({
                            name: violation.name ?? ruleName ?? "unknown",
                            severity: violation.severity,
                            relativeFilepath: violation.relativeFilepath ?? RelativeFilePath.of(""),
                            nodePath,
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
        ...createAstNodeVisitor("versionFile"),
        ...createAstNodeVisitor("apiSection"),
        ...createAstNodeVisitor("permissions"),
        ...createAstNodeVisitor("productFile")
    };
}
