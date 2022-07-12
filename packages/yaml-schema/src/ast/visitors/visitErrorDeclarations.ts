import { ErrorDeclarationSchema } from "../../schemas";
import { FernAstVisitor } from "../FernAstVisitor";
import { NodePath } from "../NodePath";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { noop } from "./utils/noop";
import { visitObject } from "./utils/ObjectPropertiesVisitor";
import { visitTypeDeclaration } from "./visitTypeDeclarations";

export function visitErrorDeclarations({
    errorDeclarations,
    visitor,
    nodePath,
}: {
    errorDeclarations: Record<string, ErrorDeclarationSchema> | undefined;
    visitor: Partial<FernAstVisitor>;
    nodePath: NodePath;
}): void {
    if (errorDeclarations == null) {
        return;
    }
    for (const [errorName, errorDeclaration] of Object.entries(errorDeclarations)) {
        const nodePathForError = [...nodePath, errorName];
        visitor.errorDeclaration?.({ errorName, declaration: errorDeclaration }, nodePathForError);
        visitErrorDeclaration(errorDeclaration, visitor, nodePathForError);
    }
}

function visitErrorDeclaration(
    declaration: ErrorDeclarationSchema,
    visitor: Partial<FernAstVisitor>,
    nodePathForError: NodePath
) {
    if (typeof declaration === "string") {
        visitor.typeReference?.(declaration, nodePathForError);
    } else {
        visitObject(declaration, {
            docs: createDocsVisitor(visitor, nodePathForError),
            type: (type) => {
                if (type == null) {
                    return;
                }
                const nodePathForErrorType = [...nodePathForError, "type"];
                if (typeof type === "string") {
                    visitor.typeReference?.(type, nodePathForErrorType);
                } else {
                    visitTypeDeclaration({ declaration: type, visitor, nodePathForType: nodePathForErrorType });
                }
            },
            http: noop,
        });
    }
}
