import { RelativeFilePath } from "@fern-api/core-utils";
import { FernAstVisitor } from "../FernAstVisitor";
import { NodePath } from "../NodePath";

export async function visitImports({
    imports,
    visitor,
    nodePath,
}: {
    imports: Record<string, RelativeFilePath> | undefined;
    visitor: Partial<FernAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    if (imports == null) {
        return;
    }
    for (const [importedAs, importPath] of Object.entries(imports)) {
        await visitor.import?.({ importPath, importedAs }, [...nodePath, importedAs]);
    }
}
