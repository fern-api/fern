import { FernServiceFileAstVisitor } from "../../FernServiceFileAstVisitor";
import { NodePath } from "../../NodePath";

export function createDocsVisitor(
    visitor: Partial<FernServiceFileAstVisitor>,
    nodePath: NodePath
): (docs: string | undefined) => void {
    return async (docs: string | undefined) => {
        if (docs != null) {
            await visitor.docs?.(docs, [...nodePath, "docs"]);
        }
    };
}
