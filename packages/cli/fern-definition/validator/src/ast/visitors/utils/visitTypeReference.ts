import { NodePath, RawSchemas } from "@fern-api/fern-definition-schema";
import { DefinitionFileAstVisitor, TypeReferenceLocation } from "../../DefinitionFileAstVisitor";

export function createTypeReferenceVisitor(
    visitor: Partial<DefinitionFileAstVisitor>
): (
    typeReference: string,
    nodePath: NodePath,
    opts?: { _default?: unknown; validation?: RawSchemas.ValidationSchema; location?: TypeReferenceLocation }
) => Promise<void> {
    return async (typeReference, nodePath, { _default, validation, location } = {}) => {
        await visitor.typeReference?.(
            {
                typeReference,
                _default,
                validation,
                location,
                nodePath
            },
            nodePath
        );
    };
}
