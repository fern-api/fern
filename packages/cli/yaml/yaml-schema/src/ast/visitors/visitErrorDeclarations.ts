import { noop, visitObject } from "@fern-api/core-utils";
import { NodePath } from "../../NodePath";
import { ErrorDeclarationSchema } from "../../schemas";
import { DefinitionFileAstVisitor } from "../DefinitionFileAstVisitor";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { createTypeReferenceVisitor } from "./utils/visitTypeReference";
import { visitTypeDeclaration } from "./visitTypeDeclarations";

export async function visitErrorDeclarations({
    errorDeclarations,
    visitor,
    nodePath
}: {
    errorDeclarations: Record<string, ErrorDeclarationSchema> | undefined;
    visitor: Partial<DefinitionFileAstVisitor>;
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
    nodePathForError
}: {
    errorName: string;
    declaration: ErrorDeclarationSchema;
    visitor: Partial<DefinitionFileAstVisitor>;
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
                        nodePathForType: nodePathForErrorType
                    });
                }
            },
            examples: async (examples) => {
                if (examples == null) {
                    return;
                }
                for (const example of examples) {
                    const nodePathForErrorExample = [...nodePathForError, "type"];
                    await visitor.exampleError?.({ errorName, declaration, example }, nodePathForErrorExample);
                }
            }
        });
    }
}
