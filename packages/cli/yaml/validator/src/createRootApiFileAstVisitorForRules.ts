import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    FernRootApiFileAstNodeTypes,
    FernRootApiFileAstNodeVisitor,
    FernRootApiFileAstVisitor,
    NodePath,
    RootApiFileSchema,
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
}): FernRootApiFileAstVisitor {
    function createAstNodeVisitor<K extends keyof FernRootApiFileAstNodeTypes>(
        nodeType: K
    ): Record<K, FernRootApiFileAstNodeVisitor<K>> {
        const visit: FernRootApiFileAstNodeVisitor<K> = async (
            node: FernRootApiFileAstNodeTypes[K],
            nodePath: NodePath
        ) => {
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

        return { [nodeType]: visit } as Record<K, FernRootApiFileAstNodeVisitor<K>>;
    }

    return {
        ...createAstNodeVisitor("defaultEnvironment"),
        ...createAstNodeVisitor("environment"),
        ...createAstNodeVisitor("errorDiscrimination"),
        ...createAstNodeVisitor("errorReference"),
    };
}
