import { PrimitiveType, TypeReference } from "@fern-api/api";
import { TsMorph } from "@fern-typescript/helper-utils";
import { HathoraEncoderConstants } from "../../constants";
import { getMethodCallForModelTypeVariableReference } from "../../method-calls/getMethodCallForModelTypeVariableReference";
import { generateBinSerdeMethodCall } from "../bin-serde/generateBinSerdeMethodCall";
import { generateBinSerdeTypeReference } from "../bin-serde/generateBinSerdeReference";
import {
    BIN_SERDE_READER_VARIABLE_NAME,
    BIN_SERDE_WRITER_VARIABLE_NAME,
    EncodeMethods,
    ENCODE_PARAMETER_NAME,
    SimpleFunctionBody,
} from "../constructEncodeMethods";

const KEY_TYPE_PARAMETER = "K";
const VALUE_TYPE_PARAMETER = "V";

export function getEncodeMethodsForMap(ts: TsMorph["ts"]): EncodeMethods {
    return {
        typeParameters: [
            ts.factory.createTypeParameterDeclaration(
                KEY_TYPE_PARAMETER,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            ),
            ts.factory.createTypeParameterDeclaration(VALUE_TYPE_PARAMETER),
        ],
        decodedType: ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("K"), undefined),
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("V"), undefined),
        ]),
        encode: getEncodeMethod(ts),
        decode: getDecodeMethod(ts),
    };
}

function getEncodeMethod(ts: TsMorph["ts"]): SimpleFunctionBody {
    const WRITE_VALUE_PARAMETER_NAME = "writeValue";
    const KEY_VARIABLE_NAME = "key";
    const VALUE_VARIABLE_NAME = "value";
    const ENTRIES_VARIABLE_NAME = "entries";

    return {
        additionalParameters: [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createIdentifier(WRITE_VALUE_PARAMETER_NAME),
                undefined,
                ts.factory.createFunctionTypeNode(
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(VALUE_VARIABLE_NAME),
                            undefined,
                            ts.factory.createTypeReferenceNode(
                                ts.factory.createIdentifier(VALUE_TYPE_PARAMETER),
                                undefined
                            ),
                            undefined
                        ),
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(BIN_SERDE_WRITER_VARIABLE_NAME),
                            undefined,
                            generateBinSerdeTypeReference(ts, HathoraEncoderConstants.BinSerDe.Exports.WRITER),
                            undefined
                        ),
                    ],
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                ),
                undefined
            ),
        ],
        statements: [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(ENTRIES_VARIABLE_NAME),
                            undefined,
                            undefined,
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("Object"),
                                    ts.factory.createIdentifier("entries")
                                ),
                                [ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(VALUE_TYPE_PARAMETER))],
                                [ts.factory.createIdentifier(ENCODE_PARAMETER_NAME)]
                            )
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ts.factory.createExpressionStatement(
                generateBinSerdeMethodCall({
                    ts,
                    utility: "writer",
                    method: "writeUVarint",
                    args: [
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(ENTRIES_VARIABLE_NAME),
                            ts.factory.createIdentifier("length")
                        ),
                    ],
                })
            ),
            ts.factory.createForOfStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createArrayBindingPattern([
                                ts.factory.createBindingElement(
                                    undefined,
                                    undefined,
                                    ts.factory.createIdentifier(KEY_VARIABLE_NAME)
                                ),
                                ts.factory.createBindingElement(
                                    undefined,
                                    undefined,
                                    ts.factory.createIdentifier(VALUE_VARIABLE_NAME)
                                ),
                            ])
                        ),
                    ],
                    ts.NodeFlags.Const
                ),
                ts.factory.createIdentifier(ENTRIES_VARIABLE_NAME),
                ts.factory.createBlock(
                    [
                        ts.factory.createExpressionStatement(
                            getMethodCallForModelTypeVariableReference({
                                ts,
                                typeReference: TypeReference.primitive(PrimitiveType.String),
                                referenceToEncoder: ts.factory.createIdentifier(HathoraEncoderConstants.NAME),
                                args: {
                                    method: "encode",
                                    variableToEncode: ts.factory.createIdentifier(KEY_VARIABLE_NAME),
                                    binSerdeWriter: ts.factory.createIdentifier(BIN_SERDE_WRITER_VARIABLE_NAME),
                                },
                            })
                        ),
                        ts.factory.createExpressionStatement(
                            ts.factory.createCallExpression(
                                ts.factory.createIdentifier(WRITE_VALUE_PARAMETER_NAME),
                                undefined,
                                [
                                    ts.factory.createIdentifier(VALUE_VARIABLE_NAME),
                                    ts.factory.createIdentifier(BIN_SERDE_WRITER_VARIABLE_NAME),
                                ]
                            )
                        ),
                    ],
                    true
                )
            ),
            ts.factory.createReturnStatement(ts.factory.createIdentifier(BIN_SERDE_WRITER_VARIABLE_NAME)),
        ],
    };
}

function getDecodeMethod(ts: TsMorph["ts"]): SimpleFunctionBody {
    const READ_VALUE_PARAMETER_NAME = "readValue";
    const SIZE_VARIABLE_NAME = "size";
    const LOOP_VARIABLE_NAME = "i";
    const RESULTANT_RECORD_VARIABLE_NAME = "record";
    const KEY_VARIABLE_NAME = "key";

    return {
        additionalParameters: [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createIdentifier(READ_VALUE_PARAMETER_NAME),
                undefined,
                ts.factory.createFunctionTypeNode(
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(BIN_SERDE_READER_VARIABLE_NAME),
                            undefined,
                            generateBinSerdeTypeReference(ts, HathoraEncoderConstants.BinSerDe.Exports.READER),
                            undefined
                        ),
                    ],
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(VALUE_TYPE_PARAMETER))
                ),
                undefined
            ),
        ],
        statements: [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(SIZE_VARIABLE_NAME),
                            undefined,
                            undefined,
                            generateBinSerdeMethodCall({ ts, utility: "reader", method: "readUVarint" })
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(RESULTANT_RECORD_VARIABLE_NAME),
                            undefined,
                            undefined,
                            ts.factory.createAsExpression(
                                ts.factory.createObjectLiteralExpression([]),
                                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(KEY_TYPE_PARAMETER)),
                                    ts.factory.createTypeReferenceNode(
                                        ts.factory.createIdentifier(VALUE_TYPE_PARAMETER)
                                    ),
                                ])
                            )
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ts.factory.createForStatement(
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(LOOP_VARIABLE_NAME),
                            undefined,
                            undefined,
                            ts.factory.createNumericLiteral("0")
                        ),
                    ],
                    ts.NodeFlags.Let
                ),
                ts.factory.createBinaryExpression(
                    ts.factory.createIdentifier(LOOP_VARIABLE_NAME),
                    ts.factory.createToken(ts.SyntaxKind.LessThanToken),
                    ts.factory.createIdentifier(SIZE_VARIABLE_NAME)
                ),
                ts.factory.createPostfixUnaryExpression(
                    ts.factory.createIdentifier(LOOP_VARIABLE_NAME),
                    ts.SyntaxKind.PlusPlusToken
                ),
                ts.factory.createBlock(
                    [
                        ts.factory.createVariableStatement(
                            undefined,
                            ts.factory.createVariableDeclarationList(
                                [
                                    ts.factory.createVariableDeclaration(
                                        ts.factory.createIdentifier(KEY_VARIABLE_NAME),
                                        undefined,
                                        undefined,
                                        getMethodCallForModelTypeVariableReference({
                                            ts,
                                            typeReference: TypeReference.primitive(PrimitiveType.String),
                                            referenceToEncoder: ts.factory.createIdentifier(
                                                HathoraEncoderConstants.NAME
                                            ),
                                            args: {
                                                method: "decode",
                                                bufferOrBinSerdeReader:
                                                    ts.factory.createIdentifier(BIN_SERDE_READER_VARIABLE_NAME),
                                            },
                                        })
                                    ),
                                ],
                                ts.NodeFlags.Const
                            )
                        ),
                        ts.factory.createExpressionStatement(
                            ts.factory.createBinaryExpression(
                                ts.factory.createElementAccessExpression(
                                    ts.factory.createIdentifier(RESULTANT_RECORD_VARIABLE_NAME),
                                    ts.factory.createIdentifier(KEY_VARIABLE_NAME)
                                ),
                                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                ts.factory.createCallExpression(
                                    ts.factory.createIdentifier(READ_VALUE_PARAMETER_NAME),
                                    undefined,
                                    [ts.factory.createIdentifier(BIN_SERDE_READER_VARIABLE_NAME)]
                                )
                            )
                        ),
                    ],
                    true
                )
            ),
            ts.factory.createReturnStatement(ts.factory.createIdentifier(RESULTANT_RECORD_VARIABLE_NAME)),
        ],
    };
}
