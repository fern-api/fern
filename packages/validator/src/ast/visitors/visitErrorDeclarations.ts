import { RawSchemas } from "@fern-api/yaml-schema";
import { FernAstVisitor } from "../AstVisitor";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { noop } from "./utils/noop";
import { visitObject } from "./utils/ObjectPropertiesVisitor";
import { visitTypeDeclaration } from "./visitTypeDeclarations";

export function visitErrorDeclarations(
    errorDeclarations: Record<string, RawSchemas.ErrorDeclarationSchema> | undefined,
    visitor: FernAstVisitor
): void {
    if (errorDeclarations == null) {
        return;
    }
    for (const [errorName, errorDeclaration] of Object.entries(errorDeclarations)) {
        visitor.errorDeclaration({ errorName, declaration: errorDeclaration });
        visitErrorDeclaration(errorDeclaration, visitor);
    }
}

function visitErrorDeclaration(declaration: RawSchemas.ErrorDeclarationSchema, visitor: FernAstVisitor) {
    if (typeof declaration === "string") {
        visitor.typeReference(declaration);
    } else {
        visitObject(declaration, {
            docs: createDocsVisitor(visitor),
            type: (type) => {
                if (type == null) {
                    return;
                }
                if (typeof type === "string") {
                    visitor.typeReference(type);
                } else {
                    visitTypeDeclaration(type, visitor);
                }
            },
            http: noop,
        });
    }
}
