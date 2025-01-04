import { NodePath } from "@fern-api/fern-definition-schema";

import { DefinitionFileAstVisitor } from "../../DefinitionFileAstVisitor";

export function createDocsVisitor(
    visitor: Partial<DefinitionFileAstVisitor>,
    nodePath: NodePath
): (docs: string | undefined) => void {
    return (docs: string | undefined) => {
        if (docs != null) {
            visitor.docs?.(docs, [...nodePath, "docs"]);
        }
    };
}
