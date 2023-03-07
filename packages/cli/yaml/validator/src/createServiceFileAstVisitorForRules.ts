import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    FernServiceFileAstNodeTypes,
    FernServiceFileAstNodeVisitor,
    FernServiceFileAstVisitor,
    NodePath,
    ServiceFileSchema,
} from "@fern-api/yaml-schema";
import { RuleVisitors } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";

export function createServiceFileAstVisitorForRules({
    relativeFilepath,
    contents,
    allRuleVisitors,
    addViolations,
}: {
    relativeFilepath: RelativeFilePath;
    contents: ServiceFileSchema;
    allRuleVisitors: RuleVisitors[];
    addViolations: (newViolations: ValidationViolation[]) => void;
}): FernServiceFileAstVisitor {
    function createAstNodeVisitor<K extends keyof FernServiceFileAstNodeTypes>(
        nodeType: K
    ): Record<K, FernServiceFileAstNodeVisitor<K>> {
        const visit: FernServiceFileAstNodeVisitor<K> = async (
            node: FernServiceFileAstNodeTypes[K],
            nodePath: NodePath
        ) => {
            for (const ruleVisitors of allRuleVisitors) {
                const visitFromRule = ruleVisitors.serviceFile?.[nodeType];
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

        return { [nodeType]: visit } as Record<K, FernServiceFileAstNodeVisitor<K>>;
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
