import { EncodeMethod, ts } from "@fern-typescript/helper-utils";
import { HathoraEncoderConstants } from "../constants";
import { generateBinSerdeTypeReference, generateBinSerdeValueReference } from "./bin-serde/generateBinSerdeReference";

export const ENCODE_PARAMETER_NAME = "value";
export const BIN_SERDE_WRITER_VARIABLE_NAME = "writer";
export const BIN_SERDE_READER_VARIABLE_NAME = "reader";

export interface EncodeMethods {
    typeParameters?: ts.TypeParameterDeclaration[];
    decodedType: ts.TypeNode;
    encode: SimpleFunctionBody;
    decode: SimpleFunctionBody;
}

export interface SimpleFunctionBody {
    additionalParameters?: ts.ParameterDeclaration[];
    statements: ts.Statement[];
}

export declare namespace constructEncodeMethods {
    export interface Args {
        methods: EncodeMethods;
    }
}

export function constructEncodeMethods({ methods }: constructEncodeMethods.Args): ts.ObjectLiteralExpression {
    const PARAMETER_NAME = "maybeReader";

    return ts.factory.createObjectLiteralExpression(
        [
            ts.factory.createMethodDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createIdentifier(EncodeMethod.Encode),
                undefined,
                methods.typeParameters,
                [
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        ENCODE_PARAMETER_NAME,
                        undefined,
                        methods.decodedType
                    ),
                    ...(methods.encode.additionalParameters ?? []),
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        ts.factory.createIdentifier(BIN_SERDE_WRITER_VARIABLE_NAME),
                        undefined,
                        undefined,
                        ts.factory.createNewExpression(
                            generateBinSerdeValueReference(HathoraEncoderConstants.BinSerDe.Exports.WRITER),
                            undefined,
                            []
                        )
                    ),
                ],
                generateBinSerdeTypeReference(HathoraEncoderConstants.BinSerDe.Exports.WRITER),
                ts.factory.createBlock(methods.encode.statements)
            ),
            ts.factory.createMethodDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createIdentifier(EncodeMethod.Decode),
                undefined,
                methods.typeParameters,
                [
                    ...(methods.decode.additionalParameters ?? []),
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        PARAMETER_NAME,
                        undefined,
                        ts.factory.createUnionTypeNode([
                            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Uint8Array")),
                            generateBinSerdeTypeReference(HathoraEncoderConstants.BinSerDe.Exports.READER),
                        ])
                    ),
                ],
                methods.decodedType,
                ts.factory.createBlock([
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    ts.factory.createIdentifier(BIN_SERDE_READER_VARIABLE_NAME),
                                    undefined,
                                    undefined,
                                    ts.factory.createConditionalExpression(
                                        ts.factory.createBinaryExpression(
                                            ts.factory.createIdentifier(PARAMETER_NAME),
                                            ts.factory.createToken(ts.SyntaxKind.InstanceOfKeyword),
                                            generateBinSerdeValueReference(
                                                HathoraEncoderConstants.BinSerDe.Exports.READER
                                            )
                                        ),
                                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                        ts.factory.createIdentifier(PARAMETER_NAME),
                                        ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                        ts.factory.createNewExpression(
                                            generateBinSerdeValueReference(
                                                HathoraEncoderConstants.BinSerDe.Exports.READER
                                            ),
                                            undefined,
                                            [ts.factory.createIdentifier(PARAMETER_NAME)]
                                        )
                                    )
                                ),
                            ],
                            ts.NodeFlags.Const
                        )
                    ),
                    ...methods.decode.statements,
                ])
            ),
        ],
        true
    );
}
