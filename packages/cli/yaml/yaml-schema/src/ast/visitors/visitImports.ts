import { NodePath } from "../../NodePath";
import { DefinitionFileAstVisitor } from "../DefinitionFileAstVisitor";

export async function visitImports({
    imports,
    visitor,
    nodePath,
}: {
    imports: Record<string, string> | undefined;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    if (imports == null) {
        return;
    }
    for (const [importedAs, importPath] of Object.entries(imports)) {
        await visitor.import?.({ importPath, importedAs }, [...nodePath, importedAs]);
    }
}
