import { NodePath } from "@fern-api/fern-definition-schema";
import { DefinitionFileAstVisitor } from "../../DefinitionFileAstVisitor";

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
