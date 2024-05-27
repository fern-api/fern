import { NodePath } from "../../../NodePath";
import { ValidationSchema } from "../../../schemas";
import { DefinitionFileAstVisitor, TypeReferenceLocation } from "../../DefinitionFileAstVisitor";

export function createTypeReferenceVisitor(
    visitor: Partial<DefinitionFileAstVisitor>
): (
    typeReference: string,
    nodePath: NodePath,
    opts?: { _default?: unknown; validation?: ValidationSchema; location?: TypeReferenceLocation }
) => Promise<void> {
    return async (typeReference, nodePath, { _default, validation, location } = {}) => {
        await visitor.typeReference?.(
            {
                typeReference,
                _default,
                validation,
                location
            },
            nodePath
        );
    };
}
