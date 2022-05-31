import { PrimitiveType, TypeReference } from "@fern-api/api";
import { ts } from "@fern-typescript/helper-utils";
import { HathoraEncoderConstants } from "../../constants";
import { getMethodCallForModelTypeVariableReference } from "../../method-calls/getMethodCallForModelTypeVariableReference";
import { generateBinSerdeTypeReference } from "../bin-serde/generateBinSerdeReference";
import {
    BIN_SERDE_READER_VARIABLE_NAME,
    BIN_SERDE_WRITER_VARIABLE_NAME,
    EncodeMethods,
    ENCODE_PARAMETER_NAME,
    SimpleFunctionBody,
} from "../constructEncodeMethods";

const VALUE_TYPE_PARAMETER = "T";

export function getEncodeMethodsForOptional(): EncodeMethods {
    return {
        typeParameters: [ts.factory.createTypeParameterDeclaration(VALUE_TYPE_PARAMETER)],
        decodedType: ts.factory.createUnionTypeNode([
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(VALUE_TYPE_PARAMETER)),
            ts.factory.createLiteralTypeNode(ts.factory.createNull()),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
        ]),
        encode: getEncodeMethod(),
        decode: getDecodeMethod(),
    };
}

function getEncodeMethod(): SimpleFunctionBody {
    const WRITE_VALUE_PARAMETER_NAME = "writeValue";
    const VALUE_VARIABLE_NAME = "value";

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
                            generateBinSerdeTypeReference(HathoraEncoderConstants.BinSerDe.Exports.WRITER),
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
                getMethodCallForModelTypeVariableReference({
                    typeReference: TypeReference.primitive(PrimitiveType.Boolean),
                    referenceToEncoder: ts.factory.createIdentifier(HathoraEncoderConstants.NAME),
                    args: {
                        method: "encode",
                        variableToEncode: ts.factory.createBinaryExpression(
                            ts.factory.createIdentifier(ENCODE_PARAMETER_NAME),
                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                            ts.factory.createNull()
                        ),
                        binSerdeWriter: ts.factory.createIdentifier(BIN_SERDE_WRITER_VARIABLE_NAME),
                    },
                })
            ),
            ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createIdentifier(ENCODE_PARAMETER_NAME),
                    ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                    ts.factory.createNull()
                ),
                ts.factory.createBlock([
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createIdentifier(WRITE_VALUE_PARAMETER_NAME),
                            undefined,
                            [
                                ts.factory.createIdentifier(ENCODE_PARAMETER_NAME),
                                ts.factory.createIdentifier(BIN_SERDE_WRITER_VARIABLE_NAME),
                            ]
                        )
                    ),
                ])
            ),
            ts.factory.createReturnStatement(ts.factory.createIdentifier(BIN_SERDE_WRITER_VARIABLE_NAME)),
        ],
    };
}

function getDecodeMethod(): SimpleFunctionBody {
    const READ_VALUE_PARAMETER_NAME = "readValue";

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
                            generateBinSerdeTypeReference(HathoraEncoderConstants.BinSerDe.Exports.READER),
                            undefined
                        ),
                    ],
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(VALUE_TYPE_PARAMETER))
                ),
                undefined
            ),
        ],
        statements: [
            ts.factory.createReturnStatement(
                ts.factory.createConditionalExpression(
                    getMethodCallForModelTypeVariableReference({
                        typeReference: TypeReference.primitive(PrimitiveType.Boolean),
                        referenceToEncoder: ts.factory.createIdentifier(HathoraEncoderConstants.NAME),
                        args: {
                            method: "decode",
                            bufferOrBinSerdeReader: ts.factory.createIdentifier(BIN_SERDE_READER_VARIABLE_NAME),
                        },
                    }),
                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                    ts.factory.createCallExpression(ts.factory.createIdentifier(READ_VALUE_PARAMETER_NAME), undefined, [
                        ts.factory.createIdentifier(BIN_SERDE_READER_VARIABLE_NAME),
                    ]),
                    ts.factory.createToken(ts.SyntaxKind.ColonToken),
                    ts.factory.createIdentifier("undefined")
                )
            ),
        ],
    };
}
