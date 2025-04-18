import { NodePath } from "@fern-api/fern-definition-schema";

import { DefinitionFileAstVisitor } from "../DefinitionFileAstVisitor";

export function visitImports({
    imports,
    visitor,
    nodePath
}: {
    imports: Record<string, string> | undefined;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePath: NodePath;
}): void {
    if (imports == null) {
        return;
    }
    for (const [importedAs, importPath] of Object.entries(imports)) {
        visitor.import?.({ importPath, importedAs }, [...nodePath, importedAs]);
    }
}
