import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    DefinitionFileSchema,
    FernDefinitionFileAstNodeTypes,
    FernDefinitionFileAstNodeVisitor,
    FernDefinitionFileAstVisitor,
    NodePath,
} from "@fern-api/yaml-schema";
import { RuleVisitors } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";

export function createDefinitionFileAstVisitorForRules({
    relativeFilepath,
    contents,
    allRuleVisitors,
    addViolations,
}: {
    relativeFilepath: RelativeFilePath;
    contents: DefinitionFileSchema;
    allRuleVisitors: RuleVisitors[];
    addViolations: (newViolations: ValidationViolation[]) => void;
}): FernDefinitionFileAstVisitor {
    function createAstNodeVisitor<K extends keyof FernDefinitionFileAstNodeTypes>(
        nodeType: K
    ): Record<K, FernDefinitionFileAstNodeVisitor<K>> {
        const visit: FernDefinitionFileAstNodeVisitor<K> = async (
            node: FernDefinitionFileAstNodeTypes[K],
            nodePath: NodePath
        ) => {
            for (const ruleVisitors of allRuleVisitors) {
                const visitFromRule = ruleVisitors.definitionFile?.[nodeType];
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

        return { [nodeType]: visit } as Record<K, FernDefinitionFileAstNodeVisitor<K>>;
    }

    return {
        ...createAstNodeVisitor("docs"),
        ...createAstNodeVisitor("import"),
        ...createAstNodeVisitor("typeReference"),
        ...createAstNodeVisitor("typeDeclaration"),
        ...createAstNodeVisitor("typeName"),
        ...createAstNodeVisitor("httpService"),
        ...createAstNodeVisitor("httpEndpoint"),
        ...createAstNodeVisitor("pathParameter"),
        ...createAstNodeVisitor("queryParameter"),
        ...createAstNodeVisitor("header"),
        ...createAstNodeVisitor("streamCondition"),
        ...createAstNodeVisitor("errorDeclaration"),
        ...createAstNodeVisitor("errorReference"),
        ...createAstNodeVisitor("exampleType"),
        ...createAstNodeVisitor("exampleTypeReference"),
        ...createAstNodeVisitor("exampleHttpEndpointCall"),
        ...createAstNodeVisitor("exampleHeaders"),
        ...createAstNodeVisitor("examplePathParameters"),
        ...createAstNodeVisitor("exampleQueryParameters"),
        ...createAstNodeVisitor("exampleRequest"),
        ...createAstNodeVisitor("exampleResponse"),
    };
}
