import { tsMorph, TsMorph } from "@fern-typescript/helper-utils";
import { HathoraEncoderConstants } from "../../constants";

export function generateBinSerdeTypeReference(ts: TsMorph["ts"], imported: string): tsMorph.ts.TypeNode {
    return ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
            ts.factory.createIdentifier(HathoraEncoderConstants.BinSerDe.NAMESPACE_IMPORT),
            ts.factory.createIdentifier(imported)
        )
    );
}

export function generateBinSerdeValueReference(
    ts: TsMorph["ts"],
    imported: string
): tsMorph.ts.PropertyAccessExpression {
    return ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(HathoraEncoderConstants.BinSerDe.NAMESPACE_IMPORT),
        ts.factory.createIdentifier(imported)
    );
}
