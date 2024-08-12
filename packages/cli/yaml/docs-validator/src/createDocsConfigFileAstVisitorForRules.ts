import { docsYml } from "@fern-api/configuration";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { NodePath } from "@fern-api/yaml-schema";
import { RuleVisitor } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";

export function createDocsConfigFileAstVisitorForRules({
    relativeFilepath,
    allRuleVisitors,
    addViolations
}: {
    relativeFilepath: RelativeFilePath;
    allRuleVisitors: RuleVisitor<docsYml.RawSchemas.Visitors.DocsConfigFileAstNodeTypes>[];
    addViolations: (newViolations: ValidationViolation[]) => void;
}): docsYml.RawSchemas.Visitors.DocsConfigFileAstVisitor {
    function createAstNodeVisitor<K extends keyof docsYml.RawSchemas.Visitors.DocsConfigFileAstNodeTypes>(
        nodeType: K
    ): Record<K, docsYml.RawSchemas.Visitors.DocsConfigFileAstNodeVisitor<K>> {
        const visit: docsYml.RawSchemas.Visitors.DocsConfigFileAstNodeVisitor<K> = async (
            node: docsYml.RawSchemas.Visitors.DocsConfigFileAstNodeTypes[K],
            nodePath: NodePath
        ) => {
            for (const ruleVisitors of allRuleVisitors) {
                const visitFromRule = ruleVisitors[nodeType];
                if (visitFromRule != null) {
                    const ruleViolations = await visitFromRule(node);
                    addViolations(
                        ruleViolations.map((violation) => ({
                            severity: violation.severity,
                            relativeFilepath,
                            nodePath,
                            message: violation.message
                        }))
                    );
                }
            }
        };

        return { [nodeType]: visit } as Record<K, docsYml.RawSchemas.Visitors.DocsConfigFileAstNodeVisitor<K>>;
    }

    return {
        ...createAstNodeVisitor("file"),
        ...createAstNodeVisitor("filepath"),
        ...createAstNodeVisitor("markdownPage"),
        ...createAstNodeVisitor("versionFile")
    };
}
