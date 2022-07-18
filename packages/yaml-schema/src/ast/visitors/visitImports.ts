import { FernAstVisitor } from "../FernAstVisitor";
import { NodePath } from "../NodePath";

export async function visitImports({
    imports,
    visitor,
    nodePath,
}: {
    imports: Record<string, string> | undefined;
    visitor: Partial<FernAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    if (imports == null) {
        return;
    }
    for (const [importKey, importPath] of Object.entries(imports)) {
        await visitor.import?.({ importKey, importPath }, [...nodePath, importPath]);
    }
}
