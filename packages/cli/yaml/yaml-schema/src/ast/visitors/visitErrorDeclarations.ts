import { noop, visitObject } from "@fern-api/core-utils";
import { ErrorDeclarationSchema } from "../../schemas";
import { FernDefinitionFileAstVisitor } from "../FernDefinitionFileAstVisitor";
import { NodePath } from "../NodePath";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { createTypeReferenceVisitor } from "./utils/visitTypeReference";
import { visitTypeDeclaration } from "./visitTypeDeclarations";

export async function visitErrorDeclarations({
    errorDeclarations,
    visitor,
    nodePath,
}: {
    errorDeclarations: Record<string, ErrorDeclarationSchema> | undefined;
    visitor: Partial<FernDefinitionFileAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    if (errorDeclarations == null) {
        return;
    }
    for (const [errorName, errorDeclaration] of Object.entries(errorDeclarations)) {
        const nodePathForError = [...nodePath, errorName];
        await visitor.errorDeclaration?.({ errorName, declaration: errorDeclaration }, nodePathForError);
        await visitErrorDeclaration({ errorName, declaration: errorDeclaration, visitor, nodePathForError });
    }
}

async function visitErrorDeclaration({
    errorName,
    declaration,
    visitor,
    nodePathForError,
}: {
    errorName: string;
    declaration: ErrorDeclarationSchema;
    visitor: Partial<FernDefinitionFileAstVisitor>;
    nodePathForError: NodePath;
}) {
    const visitTypeReference = createTypeReferenceVisitor(visitor);

    if (typeof declaration === "string") {
        await visitTypeReference(declaration, nodePathForError);
    } else {
        await visitObject(declaration, {
            docs: createDocsVisitor(visitor, nodePathForError),
            "status-code": noop,
            type: async (type) => {
                if (type == null) {
                    return;
                }
                const nodePathForErrorType = [...nodePathForError, "type"];
                if (typeof type === "string") {
                    await visitTypeReference(type, nodePathForErrorType);
                } else {
                    await visitTypeDeclaration({
                        typeName: errorName,
                        declaration: type,
                        visitor,
                        nodePathForType: nodePathForErrorType,
                    });
                }
            },
        });
    }
}
