import { NodePath } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { RuleVisitor } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";
import {
    DocsConfigFileAstNodeTypes,
    DocsConfigFileAstNodeVisitor,
    DocsConfigFileAstVisitor
} from "./docsAst/DocsConfigFileAstVisitor";

export function createDocsConfigFileAstVisitorForRules({
    relativeFilepath,
    allRuleVisitors,
    addViolations
}: {
    relativeFilepath: RelativeFilePath;
    allRuleVisitors: RuleVisitor<DocsConfigFileAstNodeTypes>[];
    addViolations: (newViolations: ValidationViolation[]) => void;
}): DocsConfigFileAstVisitor {
    function createAstNodeVisitor<K extends keyof DocsConfigFileAstNodeTypes>(
        nodeType: K
    ): Record<K, DocsConfigFileAstNodeVisitor<K>> {
        const visit: DocsConfigFileAstNodeVisitor<K> = async (
            node: DocsConfigFileAstNodeTypes[K],
            nodePath: NodePath
        ) => {
            for (const ruleVisitors of allRuleVisitors) {
                const visitFromRule = ruleVisitors[nodeType];
                if (visitFromRule != null) {
                    const ruleViolations = await visitFromRule(node);
                    addViolations(
                        ruleViolations.map((violation) => ({
                            name: violation.name,
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
