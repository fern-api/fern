import { FernAstVisitor } from "../../FernAstVisitor";
import { NodePath } from "../../NodePath";

export function createDocsVisitor(
    visitor: Partial<FernAstVisitor>,
    nodePath: NodePath
): (docs: string | undefined) => void {
    return (docs: string | undefined) => {
        if (docs != null) {
            visitor.docs?.(docs, [...nodePath, "docs"]);
        }
    };
}
