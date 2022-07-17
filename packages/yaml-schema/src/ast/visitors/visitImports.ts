import { FernAstVisitor } from "../FernAstVisitor";
import { NodePath } from "../NodePath";

export function visitImports({
    imports,
    visitor,
    nodePath,
}: {
    imports: Record<string, string> | undefined;
    visitor: Partial<FernAstVisitor>;
    nodePath: NodePath;
}): void {
    if (imports == null) {
        return;
    }
    for (const [importKey, importPath] of Object.entries(imports)) {
        visitor.import?.({ importKey, importPath }, [...nodePath, importPath]);
    }
}
