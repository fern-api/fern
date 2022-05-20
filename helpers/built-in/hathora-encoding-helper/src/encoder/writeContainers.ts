import { PrimitiveType } from "@fern-api/api";
import { TsMorph, tsMorph } from "@fern-typescript/helper-utils";
import { generateBinSerdeMethodCall } from "./bin-serde/generateBinSerdeMethodCall";
import { constructEncodeMethods, ENCODE_PARAMETER_NAME } from "./constructEncodeMethods";

export function writeContainer({ ts }: { ts: TsMorph["ts"] }): tsMorph.ts.ObjectLiteralExpression {
    return ts.factory.createObjectLiteralExpression(
        PrimitiveType._values().map((primitiveType) =>
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(getEncoderNameForPrimitive(primitiveType)),
                constructEncodeMethods({
                    methods: getEncodeMethodsForPrimitive({ primitiveType, ts }),
                    ts,
                })
            )
        ),
        true
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
    encodeBody: tsMorph.ts.Statement[];
    decodeBody: tsMorph.ts.Statement[];
}

function getEncodeMethodsForPrimitive({
    primitiveType,
    ts,
}: {
    primitiveType: PrimitiveType;
    ts: TsMorph["ts"];
}): EncodeMethods {
    return PrimitiveType._visit<EncodeMethods>(primitiveType, {
        integer: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            encodeBody: [
                ts.factory.createReturnStatement(
                    generateBinSerdeMethodCall({
                        ts,
                        utility: "writer",
                        method: "writeVarint",
                        args: [ts.factory.createIdentifier(ENCODE_PARAMETER_NAME)],
                    })
                ),
            ],
            decodeBody: [
                ts.factory.createReturnStatement(
                    generateBinSerdeMethodCall({
                        ts,
                        utility: "reader",
                        method: "readVarint",
                    })
                ),
            ],
        }),
        double: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            encodeBody: [
                ts.factory.createReturnStatement(
                    generateBinSerdeMethodCall({
                        ts,
                        utility: "writer",
                        method: "writeFloat",
                        args: [ts.factory.createIdentifier(ENCODE_PARAMETER_NAME)],
                    })
                ),
            ],
            decodeBody: [
                ts.factory.createReturnStatement(
                    generateBinSerdeMethodCall({
                        ts,
                        utility: "reader",
                        method: "readFloat",
                    })
                ),
            ],
        }),
        string: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            encodeBody: [
                ts.factory.createReturnStatement(
                    generateBinSerdeMethodCall({
                        ts,
                        utility: "writer",
                        method: "writeString",
                        args: [ts.factory.createIdentifier(ENCODE_PARAMETER_NAME)],
                    })
                ),
            ],
            decodeBody: [
                ts.factory.createReturnStatement(
                    generateBinSerdeMethodCall({
                        ts,
                        utility: "reader",
                        method: "readString",
                    })
                ),
            ],
        }),
        boolean: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
            encodeBody: [
                ts.factory.createReturnStatement(
                    generateBinSerdeMethodCall({
                        ts,
                        utility: "writer",
                        method: "writeUInt8",
                        args: [
                            ts.factory.createConditionalExpression(
                                ts.factory.createIdentifier(ENCODE_PARAMETER_NAME),
                                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                ts.factory.createNumericLiteral("1"),
                                ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                ts.factory.createNumericLiteral("0")
                            ),
                        ],
                    })
                ),
            ],
            decodeBody: [
                ts.factory.createReturnStatement(
                    ts.factory.createBinaryExpression(
                        generateBinSerdeMethodCall({
                            ts,
                            utility: "reader",
                            method: "readUInt8",
                        }),
                        ts.factory.createToken(ts.SyntaxKind.GreaterThanToken),
                        ts.factory.createNumericLiteral("0")
                    )
                ),
            ],
        }),
        long: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            encodeBody: [
                ts.factory.createThrowStatement(
                    ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
                        ts.factory.createStringLiteral("Not implemented."),
                    ])
                ),
            ],
            decodeBody: [
                ts.factory.createThrowStatement(
                    ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
                        ts.factory.createStringLiteral("Not implemented."),
                    ])
                ),
            ],
        }),
        _unknown: () => {
            throw new Error("Unknown primitive type: " + primitiveType);
        },
    });
}
