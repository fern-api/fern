import { RelativeFilePath, Workspace } from "@fern-api/workspace-parser";
import { FernConfigurationSchema } from "@fern-api/yaml-schema";
import { FernAstNodeTypes, FernAstNodeVisitor, FernAstVisitor } from "./ast/AstVisitor";
import { visitAst } from "./ast/visitAst";
import { RuleRunner } from "./Rule";
import { rules } from "./rules";

export function validateFernDefinition(workspace: Workspace): void {
    for (const [relativeFilePath, contents] of Object.entries(workspace.files)) {
        validateFernFile({ workspace, relativeFilePath, contents });
    }
}

function validateFernFile({
    workspace,
    relativeFilePath,
    contents,
}: {
    workspace: Workspace;
    relativeFilePath: RelativeFilePath;
    contents: FernConfigurationSchema;
}): void {
    const ruleRunners = rules.map((rule) => rule.create({ workspace }));
    const astVisitor = createAstVisitor({ relativeFilePath, contents, ruleRunners });
    visitAst(contents, astVisitor);
}

function createAstVisitor({
    relativeFilePath,
    contents,
    ruleRunners,
}: {
    relativeFilePath: string;
    contents: FernConfigurationSchema;
    ruleRunners: RuleRunner[];
}): FernAstVisitor {
    function createAstNodeVisitor<K extends keyof FernAstNodeTypes>(nodeType: K): Record<K, FernAstNodeVisitor<K>> {
        const visit: FernAstNodeVisitor<K> = (node: FernAstNodeTypes[K]) => {
            for (const visitor of ruleRunners) {
                visitor[nodeType]?.(node, { relativeFilePath, contents });
            }
        };
        return { [nodeType]: visit } as Record<K, FernAstNodeVisitor<K>>;
    }

    const astVisitor: FernAstVisitor = {
        ...createAstNodeVisitor("docs"),
        ...createAstNodeVisitor("import"),
        ...createAstNodeVisitor("id"),
        ...createAstNodeVisitor("typeReference"),
        ...createAstNodeVisitor("typeDeclaration"),
        ...createAstNodeVisitor("typeName"),
        ...createAstNodeVisitor("httpService"),
        ...createAstNodeVisitor("httpEndpoint"),
        ...createAstNodeVisitor("errorDeclaration"),
        ...createAstNodeVisitor("errorReference"),
    };

    return astVisitor;
}
