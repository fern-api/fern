import { noop, visitObject } from "@fern-api/core-utils";
import { NodePath, RawSchemas } from "@fern-api/fern-definition-schema";

import { DefinitionFileAstVisitor } from "../DefinitionFileAstVisitor";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { createTypeReferenceVisitor } from "./utils/visitTypeReference";
import { visitTypeDeclaration } from "./visitTypeDeclarations";

export function visitErrorDeclarations({
    errorDeclarations,
    visitor,
    nodePath
}: {
    errorDeclarations: Record<string, RawSchemas.ErrorDeclarationSchema> | undefined;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePath: NodePath;
}): void {
    if (errorDeclarations == null) {
        return;
    }
    for (const [errorName, errorDeclaration] of Object.entries(errorDeclarations)) {
        const nodePathForError = [...nodePath, errorName];
        visitor.errorDeclaration?.({ errorName, declaration: errorDeclaration }, nodePathForError);
        visitErrorDeclaration({ errorName, declaration: errorDeclaration, visitor, nodePathForError });
    }
}

function visitErrorDeclaration({
    errorName,
    declaration,
    visitor,
    nodePathForError
}: {
    errorName: string;
    declaration: RawSchemas.ErrorDeclarationSchema;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePathForError: NodePath;
}) {
    const visitTypeReference = createTypeReferenceVisitor(visitor);

    if (typeof declaration === "string") {
        visitTypeReference(declaration, nodePathForError);
    } else {
        visitObject(declaration, {
            docs: createDocsVisitor(visitor, nodePathForError),
            "status-code": noop,
            type: (type) => {
                if (type == null) {
                    return;
                }
                const nodePathForErrorType = [...nodePathForError, "type"];
                if (typeof type === "string") {
                    visitTypeReference(type, nodePathForErrorType);
                } else {
                    visitTypeDeclaration({
                        typeName: errorName,
                        declaration: type,
                        visitor,
                        nodePathForType: nodePathForErrorType
                    });
                }
            },
            examples: (examples) => {
                if (examples == null) {
                    return;
                }
                for (const example of examples) {
                    const nodePathForErrorExample = [...nodePathForError, "type"];
                    visitor.exampleError?.({ errorName, declaration, example }, nodePathForErrorExample);
                }
            }
        });
    }
}
