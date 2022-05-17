import { PrimitiveType } from "@fern-api/api";
import { EncodeMethod, tsMorph } from "@fern-typescript/helper-utils";

type TsMorph = typeof tsMorph;

export declare namespace writePrimitives {
    export interface Args {
        tsMorph: TsMorph;
    }
}

export function writePrimitives({
    tsMorph,
    tsMorph: { ts },
}: writePrimitives.Args): tsMorph.ts.ObjectLiteralExpression {
    return ts.factory.createObjectLiteralExpression(
        PrimitiveType._values().map((primitiveType) => constructEncoderForPrimitive({ primitiveType, tsMorph })),
        true
    );
}

function constructEncoderForPrimitive({
    primitiveType,
    tsMorph,
    tsMorph: { ts },
}: {
    primitiveType: PrimitiveType;
    tsMorph: TsMorph;
}): tsMorph.ts.ObjectLiteralElementLike {
    const methods = getEncodeMethodsForPrimitive({ primitiveType, tsMorph });

    return ts.factory.createPropertyAssignment(
        ts.factory.createIdentifier(getEncoderNameForPrimitive(primitiveType)),
        ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier(EncodeMethod.Encode),
                    ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                undefined,
                                "decoded",
                                undefined,
                                methods.decodedType
                            ),
                        ],
                        undefined,
                        undefined,
                        methods.encodeBody
                    )
                ),
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier(EncodeMethod.Decode),
                    ts.factory.createNumericLiteral("4")
                ),
            ],
            true
        )
    );
}

export function getEncoderNameForPrimitive(primitiveType: PrimitiveType): string {
    return PrimitiveType._visit(primitiveType, {
        integer: () => "Integer",
        double: () => "Double",
        string: () => "String",
        boolean: () => "Boolean",
        long: () => "Long",
        _unknown: () => {
            throw new Error("Unknown primitive type: " + primitiveType);
        },
    });
}

interface EncodeMethods {
    decodedType: tsMorph.ts.TypeNode;
    encodeBody: tsMorph.ts.Block;
    decodeBody: tsMorph.ts.Block;
}

function getEncodeMethodsForPrimitive({
    primitiveType,
    tsMorph: { ts },
}: {
    primitiveType: PrimitiveType;
    tsMorph: TsMorph;
}): EncodeMethods {
    return PrimitiveType._visit<EncodeMethods>(primitiveType, {
        integer: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            encodeBody: ts.factory.createBlock([], true),
            decodeBody: ts.factory.createBlock([], true),
        }),
        double: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            encodeBody: ts.factory.createBlock([], true),
            decodeBody: ts.factory.createBlock([], true),
        }),
        string: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            encodeBody: ts.factory.createBlock([], true),
            decodeBody: ts.factory.createBlock([], true),
        }),
        boolean: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
            encodeBody: ts.factory.createBlock([], true),
            decodeBody: ts.factory.createBlock([], true),
        }),
        long: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            encodeBody: ts.factory.createBlock([], true),
            decodeBody: ts.factory.createBlock([], true),
        }),
        _unknown: () => {
            throw new Error("Unknown primitive type: " + primitiveType);
        },
    });
}
