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
    for (const _import of Object.values(imports)) {
        visitor.import?.(_import, [...nodePath, _import]);
    }
}
