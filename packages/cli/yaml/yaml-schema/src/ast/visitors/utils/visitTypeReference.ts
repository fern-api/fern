import { FernServiceFileAstVisitor, TypeReferenceLocation } from "../../FernServiceFileAstVisitor";
import { NodePath } from "../../NodePath";

export function createTypeReferenceVisitor(
    visitor: Partial<FernServiceFileAstVisitor>
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
