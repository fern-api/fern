import { ModelReference, PrimitiveType, TypeDefinition, TypeReference } from "@fern-api/api";
import { generateTypeUtilsReference } from "@fern-typescript/commons";
import { ts, tsMorph } from "@fern-typescript/helper-utils";
import { ENUM_VALUES_PROPERTY_KEY } from "@fern-typescript/types";
import { HathoraEncoderConstants } from "../../constants";
import { getMethodCallForModelTypeVariableReference } from "../../method-calls/getMethodCallForModelTypeVariableReference";
import {
    BIN_SERDE_READER_VARIABLE_NAME,
    BIN_SERDE_WRITER_VARIABLE_NAME,
    EncodeMethods,
    ENCODE_PARAMETER_NAME,
    SimpleFunctionBody,
} from "../constructEncodeMethods";

export function getEncodeMethodsForEnum({
    typeDefinition,
    decodedType,
    modelDirectory,
    file,
}: {
    typeDefinition: TypeDefinition;
    decodedType: ts.TypeNode;
    modelDirectory: tsMorph.Directory;
    file: tsMorph.SourceFile;
}): EncodeMethods {
    return {
        decodedType,
        encode: getEncode({ typeDefinition, file, modelDirectory }),
        decode: getDecode({ typeDefinition, file, modelDirectory }),
    };
}
function getEncode({
    typeDefinition,
    file,
    modelDirectory,
}: {
    typeDefinition: TypeDefinition;
    file: tsMorph.SourceFile;
    modelDirectory: tsMorph.Directory;
}): SimpleFunctionBody {
    const INDEX_VARIABLE_NAME = "index";

    return {
        statements: [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(INDEX_VARIABLE_NAME),
                            undefined,
                            undefined,
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            generateTypeUtilsReference({
                                                reference: ModelReference.type(typeDefinition.name),
                                                referencedIn: file,
                                                modelDirectory,
                                            }),
                                            ts.factory.createIdentifier(ENUM_VALUES_PROPERTY_KEY)
                                        ),
                                        undefined,
                                        []
                                    ),
                                    ts.factory.createIdentifier("indexOf")
                                ),
                                undefined,
                                [ts.factory.createIdentifier(ENCODE_PARAMETER_NAME)]
                            )
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createIdentifier(INDEX_VARIABLE_NAME),
                    ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                    ts.factory.createPrefixUnaryExpression(
                        ts.SyntaxKind.MinusToken,
                        ts.factory.createNumericLiteral("1")
                    )
                ),
                ts.factory.createBlock(
                    [
                        ts.factory.createThrowStatement(
                            ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
                                ts.factory.createTemplateExpression(
                                    ts.factory.createTemplateHead(`Invalid ${typeDefinition.name.name}: `),
                                    [
                                        ts.factory.createTemplateSpan(
                                            ts.factory.createIdentifier(ENCODE_PARAMETER_NAME),
                                            ts.factory.createTemplateTail("")
                                        ),
                                    ]
                                ),
                            ])
                        ),
                    ],
                    true
                ),
                undefined
            ),
            ts.factory.createReturnStatement(
                getMethodCallForModelTypeVariableReference({
                    typeReference: TypeReference.primitive(PrimitiveType.Integer),
                    referenceToEncoder: ts.factory.createIdentifier(HathoraEncoderConstants.NAME),
                    args: {
                        method: "encode",
                        variableToEncode: ts.factory.createIdentifier(INDEX_VARIABLE_NAME),
                        binSerdeWriter: ts.factory.createIdentifier(BIN_SERDE_WRITER_VARIABLE_NAME),
                    },
                })
            ),
        ],
    };
}

function getDecode({
    typeDefinition,
    file,
    modelDirectory,
}: {
    typeDefinition: TypeDefinition;
    file: tsMorph.SourceFile;
    modelDirectory: tsMorph.Directory;
}): SimpleFunctionBody {
    const INDEX_VARIABLE_NAME = "index";
    const VALUE_VARIABLE_NAME = "value";

    return {
        statements: [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(INDEX_VARIABLE_NAME),
                            undefined,
                            undefined,
                            getMethodCallForModelTypeVariableReference({
                                typeReference: TypeReference.primitive(PrimitiveType.Integer),
                                referenceToEncoder: ts.factory.createIdentifier(HathoraEncoderConstants.NAME),
                                args: {
                                    method: "decode",
                                    bufferOrBinSerdeReader: ts.factory.createIdentifier(BIN_SERDE_READER_VARIABLE_NAME),
                                },
                            })
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
                            ts.factory.createIdentifier(VALUE_VARIABLE_NAME),
                            undefined,
                            undefined,
                            ts.factory.createElementAccessExpression(
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        generateTypeUtilsReference({
                                            reference: ModelReference.type(typeDefinition.name),
                                            referencedIn: file,
                                            modelDirectory,
                                        }),
                                        ts.factory.createIdentifier(ENUM_VALUES_PROPERTY_KEY)
                                    ),
                                    undefined,
                                    []
                                ),
                                ts.factory.createIdentifier(INDEX_VARIABLE_NAME)
                            )
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createIdentifier(VALUE_VARIABLE_NAME),
                    ts.factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
                    ts.factory.createNull()
                ),
                ts.factory.createBlock(
                    [
                        ts.factory.createThrowStatement(
                            ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
                                ts.factory.createTemplateExpression(
                                    ts.factory.createTemplateHead(`Invalid ${typeDefinition.name.name} index: `),
                                    [
                                        ts.factory.createTemplateSpan(
                                            ts.factory.createIdentifier(INDEX_VARIABLE_NAME),
                                            ts.factory.createTemplateTail("")
                                        ),
                                    ]
                                ),
                            ])
                        ),
                    ],
                    true
                )
            ),
            ts.factory.createReturnStatement(ts.factory.createIdentifier(VALUE_VARIABLE_NAME)),
        ],
    };
}
