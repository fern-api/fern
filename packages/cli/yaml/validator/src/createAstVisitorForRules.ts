import { RelativeFilePath } from "@fern-api/core-utils";
import {
    FernAstNodeTypes,
    FernAstNodeVisitor,
    FernAstVisitor,
    NodePath,
    RootApiFileSchema,
    ServiceFileSchema,
} from "@fern-api/yaml-schema";
import { RuleRunner } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";

export function createAstVisitorForRules({
    relativeFilepath,
    contents,
    ruleRunners,
    addViolations,
}: {
    relativeFilepath: RelativeFilePath;
    contents: ServiceFileSchema | RootApiFileSchema;
    ruleRunners: RuleRunner[];
    addViolations: (newViolations: ValidationViolation[]) => void;
}): FernAstVisitor {
    function createAstNodeVisitor<K extends keyof FernAstNodeTypes>(nodeType: K): Record<K, FernAstNodeVisitor<K>> {
        const visit: FernAstNodeVisitor<K> = async (node: FernAstNodeTypes[K], nodePath: NodePath) => {
            for (const visitorInRule of ruleRunners) {
                const visitFromRule = visitorInRule[nodeType];
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

        return { [nodeType]: visit } as Record<K, FernAstNodeVisitor<K>>;
    }

    if (isRootApiFile(contents)) {
        return {
            docs: () => void {},
            import: () => void {},
            typeReference: () => void {},
            typeDeclaration: () => void {},
            typeName: () => void {},
            httpService: () => void {},
            httpEndpoint: () => void {},
            queryParameter: () => void {},
            errorDeclaration: () => void {},
            errorReference: () => void {},
            ...createAstNodeVisitor("defaultEnvironment"),
        };
    } else {
        return {
            ...createAstNodeVisitor("docs"),
            ...createAstNodeVisitor("import"),
            ...createAstNodeVisitor("typeReference"),
            ...createAstNodeVisitor("typeDeclaration"),
            ...createAstNodeVisitor("typeName"),
            ...createAstNodeVisitor("httpService"),
            ...createAstNodeVisitor("httpEndpoint"),
            ...createAstNodeVisitor("queryParameter"),
            ...createAstNodeVisitor("errorDeclaration"),
            ...createAstNodeVisitor("errorReference"),
            defaultEnvironment: () => void {},
        };
    }
}

function isRootApiFile(contents: ServiceFileSchema | RootApiFileSchema): contents is RootApiFileSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (contents as RootApiFileSchema).name !== undefined;
}
