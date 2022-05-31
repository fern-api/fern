import { ts } from "@fern-typescript/helper-utils";
import { HathoraEncoderConstants } from "../../constants";

export function generateBinSerdeTypeReference(imported: string): ts.TypeNode {
    return ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
            ts.factory.createIdentifier(HathoraEncoderConstants.BinSerDe.NAMESPACE_IMPORT),
            ts.factory.createIdentifier(imported)
        )
    );
}

export function generateBinSerdeValueReference(imported: string): ts.PropertyAccessExpression {
    return ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(HathoraEncoderConstants.BinSerDe.NAMESPACE_IMPORT),
        ts.factory.createIdentifier(imported)
    );
}
