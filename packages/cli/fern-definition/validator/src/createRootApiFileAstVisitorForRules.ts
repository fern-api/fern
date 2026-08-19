import { NodePath, RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RootApiFileAstNodeTypes, RootApiFileAstNodeVisitor, RootApiFileAstVisitor } from "./ast/index.js";
import { NamedRuleVisitors } from "./Rule.js";
import { ValidationViolation } from "./ValidationViolation.js";

export function createRootApiFileAstVisitorForRules({
    relativeFilepath,
    contents,
    allRuleVisitors,
    addViolations
}: {
    relativeFilepath: RelativeFilePath;
    contents: RootApiFileSchema;
    allRuleVisitors: NamedRuleVisitors[];
    addViolations: (newViolations: ValidationViolation[]) => void;
}): RootApiFileAstVisitor {
    function createAstNodeVisitor<K extends keyof RootApiFileAstNodeTypes>(
        nodeType: K
    ): Record<K, RootApiFileAstNodeVisitor<K>> {
        const visit: RootApiFileAstNodeVisitor<K> = (node: RootApiFileAstNodeTypes[K], nodePath: NodePath) => {
            for (const { name: ruleName, visitors: ruleVisitors } of allRuleVisitors) {
                const visitFromRule = ruleVisitors.rootApiFile?.[nodeType];
                if (visitFromRule != null) {
                    const ruleViolations = visitFromRule(node, { relativeFilepath, contents });
                    addViolations(
                        ruleViolations.map((violation) => ({
                            name: ruleName,
                            severity: violation.severity,
                            relativeFilepath,
                            nodePath,
                            message: violation.message
                        }))
                    );
                }
            }
        };

        return { [nodeType]: visit } as Record<K, RootApiFileAstNodeVisitor<K>>;
    }

    return {
        ...createAstNodeVisitor("file"),
        ...createAstNodeVisitor("oauth"),
        ...createAstNodeVisitor("defaultEnvironment"),
        ...createAstNodeVisitor("environment"),
        ...createAstNodeVisitor("errorDiscrimination"),
        ...createAstNodeVisitor("errorReference"),
        ...createAstNodeVisitor("variableDeclaration"),
        ...createAstNodeVisitor("variableReference"),
        ...createAstNodeVisitor("pathParameter")
    };
}
