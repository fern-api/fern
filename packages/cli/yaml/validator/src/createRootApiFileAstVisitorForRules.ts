import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    NodePath,
    RootApiFileAstNodeTypes,
    RootApiFileAstNodeVisitor,
    RootApiFileAstVisitor,
    RootApiFileSchema
} from "@fern-api/yaml-schema";
import { RuleVisitors } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";

export function createRootApiFileAstVisitorForRules({
    relativeFilepath,
    contents,
    allRuleVisitors,
    addViolations,
}: {
    relativeFilepath: RelativeFilePath;
    contents: RootApiFileSchema;
    allRuleVisitors: RuleVisitors[];
    addViolations: (newViolations: ValidationViolation[]) => void;
}): RootApiFileAstVisitor {
    function createAstNodeVisitor<K extends keyof RootApiFileAstNodeTypes>(
        nodeType: K
    ): Record<K, RootApiFileAstNodeVisitor<K>> {
        const visit: RootApiFileAstNodeVisitor<K> = async (node: RootApiFileAstNodeTypes[K], nodePath: NodePath) => {
            for (const ruleVisitors of allRuleVisitors) {
                const visitFromRule = ruleVisitors.rootApiFile?.[nodeType];
                if (visitFromRule != null) {
                    const ruleViolations = await visitFromRule(node, { relativeFilepath, contents });
                    addViolations(
                        ruleViolations.map((violation) => ({
                            severity: violation.severity,
                            relativeFilepath,
                            nodePath,
                            message: violation.message,
                        }))
                    );
                }
            }
        };

        return { [nodeType]: visit } as Record<K, RootApiFileAstNodeVisitor<K>>;
    }

    return {
        ...createAstNodeVisitor("file"),
        ...createAstNodeVisitor("defaultEnvironment"),
        ...createAstNodeVisitor("environment"),
        ...createAstNodeVisitor("errorDiscrimination"),
        ...createAstNodeVisitor("errorReference"),
        ...createAstNodeVisitor("variableDeclaration"),
        ...createAstNodeVisitor("variableReference"),
        ...createAstNodeVisitor("pathParameter"),
    };
}
