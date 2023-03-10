import { FernDefinitionFileAstVisitor, TypeReferenceLocation } from "../../FernDefinitionFileAstVisitor";
import { NodePath } from "../../NodePath";

export function createTypeReferenceVisitor(
    visitor: Partial<FernDefinitionFileAstVisitor>
): (typeReference: string, nodePath: NodePath, opts?: { location?: TypeReferenceLocation }) => Promise<void> {
    return async (typeReference, nodePath, { location } = {}) => {
        await visitor.typeReference?.(
            {
                typeReference,
                location,
            },
            nodePath
        );
    };
}
