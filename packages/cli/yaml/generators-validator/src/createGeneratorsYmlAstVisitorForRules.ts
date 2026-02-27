import { generatorsYml } from "@fern-api/configuration-loader";
import { NodePath } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    GeneratorsYmlFileAstNodeTypes,
    GeneratorsYmlFileAstNodeVisitor,
    GeneratorsYmlFileAstVisitor
} from "./ast/GeneratorsYmlAstVisitor.js";
import { NamedRuleVisitors } from "./Rule.js";
import { ValidationViolation } from "./ValidationViolation.js";

export function createGeneratorsYmlAstVisitorForRules({
    relativeFilepath,
    contents,
    allRuleVisitors,
    addViolations
}: {
    relativeFilepath: RelativeFilePath;
    contents: generatorsYml.GeneratorsConfigurationSchema;
    allRuleVisitors: NamedRuleVisitors[];
    addViolations: (newViolations: ValidationViolation[]) => void;
}): GeneratorsYmlFileAstVisitor {
    function createAstNodeVisitor<K extends keyof GeneratorsYmlFileAstNodeTypes>(
        nodeType: K
    ): Record<K, GeneratorsYmlFileAstNodeVisitor<K>> {
        const visit: GeneratorsYmlFileAstNodeVisitor<K> = async (
            node: GeneratorsYmlFileAstNodeTypes[K],
            nodePath: NodePath
        ) => {
            for (const { name: ruleName, visitors: ruleVisitors } of allRuleVisitors) {
                const visitFromRule = ruleVisitors.generatorsYml?.[nodeType];
                if (visitFromRule != null) {
                    const ruleViolations = await visitFromRule(node, { relativeFilepath, contents });
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

        return { [nodeType]: visit } as Record<K, GeneratorsYmlFileAstNodeVisitor<K>>;
    }

    return {
        ...createAstNodeVisitor("file"),
        ...createAstNodeVisitor("generatorInvocation")
    };
}
