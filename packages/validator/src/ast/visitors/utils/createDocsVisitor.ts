import { FernAstVisitor } from "../../AstVisitor";

export function createDocsVisitor(visitor: Partial<FernAstVisitor>): (docs: string | undefined) => void {
    return (docs: string | undefined) => {
        if (docs != null) {
            visitor.docs?.(docs);
        }
    };
}
