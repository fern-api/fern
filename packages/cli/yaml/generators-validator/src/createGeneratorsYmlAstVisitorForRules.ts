import { generatorsYml } from "@fern-api/configuration-loader";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { NodePath } from "@fern-api/validation-utils";

import { ValidationViolation } from "@fern-api/validation-utils";
import { GeneratorsYmlFileAstNodeTypes, GeneratorsYmlFileAstNodeVisitor, GeneratorsYmlFileAstVisitor } from "./ast/GeneratorsYmlAstVisitor";
import { RuleVisitors } from "./Rule";

export function createGeneratorsYmlAstVisitorForRules({
    relativeFilepath,
    contents,
    allRuleVisitors,
    addViolations
}: {
    relativeFilepath: RelativeFilePath;
    contents: generatorsYml.GeneratorsConfigurationSchema;
    allRuleVisitors: RuleVisitors[];
    addViolations: (newViolations: ValidationViolation[]) => void;
}): GeneratorsYmlFileAstVisitor {
    function createAstNodeVisitor<K extends keyof GeneratorsYmlFileAstNodeTypes>(
        nodeType: K
    ): Record<K, GeneratorsYmlFileAstNodeVisitor<K>> {
        const visit: GeneratorsYmlFileAstNodeVisitor<K> = async (
            node: GeneratorsYmlFileAstNodeTypes[K],
            nodePath: NodePath
        ) => {
            for (const ruleVisitors of allRuleVisitors) {
                const visitFromRule = ruleVisitors.generatorsYml?.[nodeType];
                if (visitFromRule != null) {
                    const ruleViolations = await visitFromRule(node, { relativeFilepath, contents });
                    addViolations(
                        ruleViolations.map((violation) => ({
                            name: violation.name,
                            severity: violation.severity,
                            relativeFilepath,
                            nodePath,
                            message: violation.message
                        }))
                    );
                }
            }
        };

        return { [nodeType]: visit } as Record<K, GeneratorsYmlFileAstNodeVisitor<K>>;
    }

    return {
        ...createAstNodeVisitor("file"),
        ...createAstNodeVisitor("generatorInvocation")
    };
}
