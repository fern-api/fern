import { RawSchemas } from "@fern-api/yaml-schema";
import { FernAstVisitor } from "../AstVisitor";

export function visitTypeDeclarations(
    typeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> | undefined,
    visitor: Partial<FernAstVisitor>
): void {
    if (typeDeclarations == null) {
        return;
    }
    for (const [typeName, declaration] of Object.entries(typeDeclarations)) {
        visitor.typeDeclaration?.({ typeName, declaration });
        visitTypeDeclaration(declaration, visitor);
    }
}

export function visitTypeDeclaration(
    declaration: RawSchemas.TypeDeclarationSchema,
    visitor: Partial<FernAstVisitor>
): void {
    if (typeof declaration === "string") {
        visitor.typeReference?.(declaration);
    } else {
        // TODO visit raw type declaration
    }
}
