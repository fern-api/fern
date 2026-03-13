import { DefinitionFileSchema, NodePath } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileAstNodeTypes, DefinitionFileAstNodeVisitor, DefinitionFileAstVisitor } from "./ast/index.js";
import { NamedRuleVisitors } from "./Rule.js";
import { ValidationViolation } from "./ValidationViolation.js";

export function createDefinitionFileAstVisitorForRules({
    relativeFilepath,
    contents,
    allRuleVisitors,
    addViolations
}: {
    relativeFilepath: RelativeFilePath;
    contents: DefinitionFileSchema;
    allRuleVisitors: NamedRuleVisitors[];
    addViolations: (newViolations: ValidationViolation[]) => void;
}): DefinitionFileAstVisitor {
    function createAstNodeVisitor<K extends keyof DefinitionFileAstNodeTypes>(
        nodeType: K
    ): Record<K, DefinitionFileAstNodeVisitor<K>> {
        const visit: DefinitionFileAstNodeVisitor<K> = (node: DefinitionFileAstNodeTypes[K], nodePath: NodePath) => {
            for (const { name: ruleName, visitors: ruleVisitors } of allRuleVisitors) {
                const visitFromRule = ruleVisitors.definitionFile?.[nodeType];
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

        return { [nodeType]: visit } as Record<K, DefinitionFileAstNodeVisitor<K>>;
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
        ...createAstNodeVisitor("streamCondition"),
        ...createAstNodeVisitor("header"),
        ...createAstNodeVisitor("webhookSignature"),
        ...createAstNodeVisitor("errorDeclaration"),
        ...createAstNodeVisitor("errorReference"),
        ...createAstNodeVisitor("exampleType"),
        ...createAstNodeVisitor("exampleTypeReference"),
        ...createAstNodeVisitor("exampleHttpEndpointCall"),
        ...createAstNodeVisitor("exampleCodeSample"),
        ...createAstNodeVisitor("exampleHeaders"),
        ...createAstNodeVisitor("examplePathParameters"),
        ...createAstNodeVisitor("exampleQueryParameters"),
        ...createAstNodeVisitor("exampleRequest"),
        ...createAstNodeVisitor("exampleResponse"),
        ...createAstNodeVisitor("variableReference"),
        ...createAstNodeVisitor("extension"),
        ...createAstNodeVisitor("serviceBaseUrl"),
        ...createAstNodeVisitor("endpointBaseUrl"),
        ...createAstNodeVisitor("exampleError")
    };
}
