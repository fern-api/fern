import { TsMorph } from "@fern-typescript/helper-utils";
import { HathoraEncoderConstants } from "../../constants";
import { generateBinSerdeMethodCall } from "../bin-serde/generateBinSerdeMethodCall";
import { generateBinSerdeTypeReference } from "../bin-serde/generateBinSerdeReference";
import {
    BIN_SERDE_READER_VARIABLE_NAME,
    BIN_SERDE_WRITER_VARIABLE_NAME,
    EncodeMethods,
    ENCODE_PARAMETER_NAME,
    SimpleFunctionBody,
} from "../constructEncodeMethods";

const ITEM_TYPE_PARAMETER = "T";

export function getEncodeMethodsForList(ts: TsMorph["ts"]): EncodeMethods {
    return {
        typeParameters: [ts.factory.createTypeParameterDeclaration(ITEM_TYPE_PARAMETER)],
        decodedType: ts.factory.createArrayTypeNode(
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(ITEM_TYPE_PARAMETER), undefined)
        ),
        encode: getEncodeMethod(ts),
        decode: getDecodeMethod(ts),
    };
}

function getEncodeMethod(ts: TsMorph["ts"]): SimpleFunctionBody {
    const WRITE_ITEM_PARAMETER_NAME = "writeItem";
    const ITEM_VARIABLE_NAME = "item";

    return {
        additionalParameters: [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createIdentifier(WRITE_ITEM_PARAMETER_NAME),
                undefined,
                ts.factory.createFunctionTypeNode(
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(ITEM_VARIABLE_NAME),
                            undefined,
                            ts.factory.createTypeReferenceNode(
                                ts.factory.createIdentifier(ITEM_TYPE_PARAMETER),
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
            ts.factory.createExpressionStatement(
                generateBinSerdeMethodCall({
                    ts,
                    utility: "writer",
                    method: "writeUVarint",
                    args: [
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(ENCODE_PARAMETER_NAME),
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
                            ts.factory.createIdentifier(ITEM_VARIABLE_NAME),
                            undefined,
                            undefined,
                            undefined
                        ),
                    ],
                    ts.NodeFlags.Const
                ),
                ts.factory.createIdentifier(ENCODE_PARAMETER_NAME),
                ts.factory.createBlock(
                    [
                        ts.factory.createExpressionStatement(
                            ts.factory.createCallExpression(
                                ts.factory.createIdentifier(WRITE_ITEM_PARAMETER_NAME),
                                undefined,
                                [
                                    ts.factory.createIdentifier(ITEM_VARIABLE_NAME),
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
    const READ_ITEM_PARAMETER_NAME = "readItem";
    const LENGTH_VARIABLE_NAME = "length";
    const LOOP_VARIABLE_NAME = "i";
    const RESULTANT_ARRAY_VARIABLE_NAME = "list";

    return {
        additionalParameters: [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createIdentifier(READ_ITEM_PARAMETER_NAME),
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
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(ITEM_TYPE_PARAMETER))
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
                            ts.factory.createIdentifier(LENGTH_VARIABLE_NAME),
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
                            ts.factory.createIdentifier(RESULTANT_ARRAY_VARIABLE_NAME),
                            undefined,
                            ts.factory.createArrayTypeNode(
                                ts.factory.createTypeReferenceNode(
                                    ts.factory.createIdentifier(ITEM_TYPE_PARAMETER),
                                    undefined
                                )
                            ),
                            ts.factory.createArrayLiteralExpression([])
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
                    ts.factory.createIdentifier(LENGTH_VARIABLE_NAME)
                ),
                ts.factory.createPostfixUnaryExpression(
                    ts.factory.createIdentifier(LOOP_VARIABLE_NAME),
                    ts.SyntaxKind.PlusPlusToken
                ),
                ts.factory.createBlock(
                    [
                        ts.factory.createExpressionStatement(
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(RESULTANT_ARRAY_VARIABLE_NAME),
                                    ts.factory.createIdentifier("push")
                                ),
                                undefined,
                                [
                                    ts.factory.createCallExpression(
                                        ts.factory.createIdentifier(READ_ITEM_PARAMETER_NAME),
                                        undefined,
                                        [ts.factory.createIdentifier(BIN_SERDE_READER_VARIABLE_NAME)]
                                    ),
                                ]
                            )
                        ),
                    ],
                    true
                )
            ),
            ts.factory.createReturnStatement(ts.factory.createIdentifier(RESULTANT_ARRAY_VARIABLE_NAME)),
        ],
    };
}
