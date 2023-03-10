import { DefinitionFileAstVisitor } from "../../DefinitionFileAstVisitor";
import { NodePath } from "../../NodePath";

export function createDocsVisitor(
    visitor: Partial<DefinitionFileAstVisitor>,
    nodePath: NodePath
): (docs: string | undefined) => Promise<void> {
    return async (docs: string | undefined) => {
        if (docs != null) {
            await visitor.docs?.(docs, [...nodePath, "docs"]);
        }
    };
}
