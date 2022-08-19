import { noop, visitObject } from "@fern-api/core-utils";
import { ErrorDeclarationSchema } from "../../schemas";
import { FernAstVisitor } from "../FernAstVisitor";
import { NodePath } from "../NodePath";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { visitTypeDeclaration } from "./visitTypeDeclarations";

export async function visitErrorDeclarations({
    errorDeclarations,
    visitor,
    nodePath,
}: {
    errorDeclarations: Record<string, ErrorDeclarationSchema> | undefined;
    visitor: Partial<FernAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    if (errorDeclarations == null) {
        return;
    }
    for (const [errorName, errorDeclaration] of Object.entries(errorDeclarations)) {
        const nodePathForError = [...nodePath, errorName];
        await visitor.errorDeclaration?.({ errorName, declaration: errorDeclaration }, nodePathForError);
        await visitErrorDeclaration(errorDeclaration, visitor, nodePathForError);
    }
}

async function visitErrorDeclaration(
    declaration: ErrorDeclarationSchema,
    visitor: Partial<FernAstVisitor>,
    nodePathForError: NodePath
) {
    if (typeof declaration === "string") {
        await visitor.typeReference?.(declaration, nodePathForError);
    } else {
        await visitObject(declaration, {
            docs: createDocsVisitor(visitor, nodePathForError),
            type: async (type) => {
                if (type == null) {
                    return;
                }
                const nodePathForErrorType = [...nodePathForError, "type"];
                if (typeof type === "string") {
                    await visitor.typeReference?.(type, nodePathForErrorType);
                } else {
                    await visitTypeDeclaration({ declaration: type, visitor, nodePathForType: nodePathForErrorType });
                }
            },
            http: noop,
        });
    }
}
