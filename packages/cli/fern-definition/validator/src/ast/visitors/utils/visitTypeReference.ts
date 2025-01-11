import { NodePath, RawSchemas } from "@fern-api/fern-definition-schema";

import { DefinitionFileAstVisitor, TypeReferenceLocation } from "../../DefinitionFileAstVisitor";

export function createTypeReferenceVisitor(
    visitor: Partial<DefinitionFileAstVisitor>
): (
    typeReference: string,
    nodePath: NodePath,
    opts?: { _default?: unknown; validation?: RawSchemas.ValidationSchema; location?: TypeReferenceLocation }
) => void {
    return (typeReference, nodePath, { _default, validation, location } = {}) => {
        visitor.typeReference?.(
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
