import { FernDefinitionFileAstVisitor } from "../../FernDefinitionFileAstVisitor";
import { NodePath } from "../../NodePath";

export function createDocsVisitor(
    visitor: Partial<FernDefinitionFileAstVisitor>,
    nodePath: NodePath
): (docs: string | undefined) => Promise<void> {
    return async (docs: string | undefined) => {
        if (docs != null) {
            await visitor.docs?.(docs, [...nodePath, "docs"]);
        }
    };
}
