import { PrimitiveType } from "@fern-api/api";
import { FernWriters, getTextOfTsNode } from "@fern-typescript/commons";
import { ts, tsMorph } from "@fern-typescript/helper-utils";
import { getEncoderNameForPrimitive } from "../constants";
import { generateBinSerdeMethodCall } from "./bin-serde/generateBinSerdeMethodCall";
import { constructEncodeMethods, EncodeMethods, ENCODE_PARAMETER_NAME } from "./constructEncodeMethods";

export function writePrimitives(): tsMorph.WriterFunction {
    const writer = FernWriters.object.writer({ newlinesBetweenProperties: true });

    for (const primitiveType of PrimitiveType._values()) {
        writer.addProperty({
            key: getEncoderNameForPrimitive(primitiveType),
            value: getTextOfTsNode(
                constructEncodeMethods({
                    methods: getEncodeMethodsForPrimitive({ primitiveType }),
                })
            ),
        });
    }

    return writer.toFunction();
}

function getEncodeMethodsForPrimitive({ primitiveType }: { primitiveType: PrimitiveType }): EncodeMethods {
    return PrimitiveType._visit<EncodeMethods>(primitiveType, {
        integer: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            encode: {
                statements: [
                    ts.factory.createReturnStatement(
                        generateBinSerdeMethodCall({
                            utility: "writer",
                            method: "writeVarint",
                            args: [ts.factory.createIdentifier(ENCODE_PARAMETER_NAME)],
                        })
                    ),
                ],
            },
            decode: {
                statements: [
                    ts.factory.createReturnStatement(
                        generateBinSerdeMethodCall({
                            utility: "reader",
                            method: "readVarint",
                        })
                    ),
                ],
            },
        }),
        double: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            encode: {
                statements: [
                    ts.factory.createReturnStatement(
                        generateBinSerdeMethodCall({
                            utility: "writer",
                            method: "writeFloat",
                            args: [ts.factory.createIdentifier(ENCODE_PARAMETER_NAME)],
                        })
                    ),
                ],
            },
            decode: {
                statements: [
                    ts.factory.createReturnStatement(
                        generateBinSerdeMethodCall({
                            utility: "reader",
                            method: "readFloat",
                        })
                    ),
                ],
            },
        }),
        string: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            encode: {
                statements: [
                    ts.factory.createReturnStatement(
                        generateBinSerdeMethodCall({
                            utility: "writer",
                            method: "writeString",
                            args: [ts.factory.createIdentifier(ENCODE_PARAMETER_NAME)],
                        })
                    ),
                ],
            },
            decode: {
                statements: [
                    ts.factory.createReturnStatement(
                        generateBinSerdeMethodCall({
                            utility: "reader",
                            method: "readString",
                        })
                    ),
                ],
            },
        }),
        boolean: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
            encode: {
                statements: [
                    ts.factory.createReturnStatement(
                        generateBinSerdeMethodCall({
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
            },
            decode: {
                statements: [
                    ts.factory.createReturnStatement(
                        ts.factory.createBinaryExpression(
                            generateBinSerdeMethodCall({
                                utility: "reader",
                                method: "readUInt8",
                            }),
                            ts.factory.createToken(ts.SyntaxKind.GreaterThanToken),
                            ts.factory.createNumericLiteral("0")
                        )
                    ),
                ],
            },
        }),
        long: () => ({
            decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            encode: {
                statements: [
                    ts.factory.createThrowStatement(
                        ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
                            ts.factory.createStringLiteral("Not implemented."),
                        ])
                    ),
                ],
            },
            decode: {
                statements: [
                    ts.factory.createThrowStatement(
                        ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
                            ts.factory.createStringLiteral("Not implemented."),
                        ])
                    ),
                ],
            },
        }),
        _unknown: () => {
            throw new Error("Unknown primitive type: " + primitiveType);
        },
    });
}
