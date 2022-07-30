import { ErrorDeclarationSchema } from "../../schemas";
import { FernAstVisitor } from "../FernAstVisitor";
import { NodePath } from "../NodePath";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { noop } from "./utils/noop";
import { visitObject } from "./utils/ObjectPropertiesVisitor";
import { visitExtends, visitObjectProperties } from "./visitTypeDeclarations";

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
            extends: (_extends) => visitExtends({ _extends, visitor, nodePath: nodePathForError }),
            properties: (objectProperties) =>
                visitObjectProperties({ objectProperties, visitor, nodePath: nodePathForError }),
            statusCode: noop,
        });
    }
}
