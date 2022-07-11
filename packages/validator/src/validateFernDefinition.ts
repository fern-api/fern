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
    const astVisitor = createAstVisitor({ workspace, relativeFilePath, contents });
    visitAst(contents, astVisitor);
}

function createAstVisitor({
    workspace,
    relativeFilePath,
    contents,
}: {
    workspace: Workspace;
    relativeFilePath: string;
    contents: FernConfigurationSchema;
}): FernAstVisitor {
    const ruleRunners = rules.map((rule) =>
        rule.create({
            workspace,
            relativeFilePath,
            contents,
        })
    );

    const astVisitor: FernAstVisitor = {
        ...createAstNodeVisitor("docs", ruleRunners),
        ...createAstNodeVisitor("import", ruleRunners),
        ...createAstNodeVisitor("id", ruleRunners),
        ...createAstNodeVisitor("typeReference", ruleRunners),
        ...createAstNodeVisitor("typeDeclaration", ruleRunners),
        ...createAstNodeVisitor("typeName", ruleRunners),
        ...createAstNodeVisitor("httpService", ruleRunners),
        ...createAstNodeVisitor("httpEndpoint", ruleRunners),
        ...createAstNodeVisitor("errorDeclaration", ruleRunners),
        ...createAstNodeVisitor("errorReference", ruleRunners),
    };

    return astVisitor;
}

function createAstNodeVisitor<K extends keyof FernAstNodeTypes>(
    key: K,
    ruleRunners: RuleRunner[]
): Record<K, FernAstNodeVisitor<K>> {
    const visit: FernAstNodeVisitor<K> = (node: FernAstNodeTypes[K]) => {
        for (const visitor of ruleRunners) {
            visitor[key]?.(node);
        }
    };
    return { [key]: visit } as Record<K, FernAstNodeVisitor<K>>;
}
