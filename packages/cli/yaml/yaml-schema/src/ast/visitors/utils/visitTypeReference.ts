import { NodePath } from "../../../NodePath";
import { DefinitionFileAstVisitor, TypeReferenceLocation } from "../../DefinitionFileAstVisitor";

export function createTypeReferenceVisitor(
    visitor: Partial<DefinitionFileAstVisitor>
): (typeReference: string, nodePath: NodePath, opts?: { location?: TypeReferenceLocation }) => Promise<void> {
    return async (typeReference, nodePath, { location } = {}) => {
        await visitor.typeReference?.(
            {
                typeReference,
                location
            },
            nodePath
        );
    };
}
