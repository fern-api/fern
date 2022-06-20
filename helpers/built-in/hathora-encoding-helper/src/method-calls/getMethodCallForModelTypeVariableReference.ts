import { ContainerType, TypeReference } from "@fern-api/api";
import { ts } from "@fern-typescript/helper-utils";
import { getEncoderNameForContainer, getEncoderNameForPrimitive, HathoraEncoderConstants } from "../constants";
import { createEncoderMethodCall } from "./createEncoderMethodCall";

export declare namespace getMethodCallForModelTypeVariableReference {
    export interface Args {
        typeReference: TypeReference;
        referenceToEncoder: ts.Expression;
        args: MethodCallArguments;
    }

    export type MethodCallArguments = EncodeMethodCallArguments | DecodeMethodCallArguments;

    export interface EncodeMethodCallArguments {
        method: "encode";
        variableToEncode: ts.Expression;
        binSerdeWriter: ts.Expression | undefined;
    }

    export interface DecodeMethodCallArguments {
        method: "decode";
        bufferOrBinSerdeReader: ts.Expression;
    }
}

export function getMethodCallForModelTypeVariableReference({
    typeReference,
    referenceToEncoder,
    args,
}: getMethodCallForModelTypeVariableReference.Args): ts.CallExpression {
    return createEncoderMethodCall({
        referenceToEncoder,
        propertyChainToMethod: createMethodReferencePropertyChain(typeReference),
        method: args.method,
        args: getArgsForMethod({ typeReference, referenceToEncoder, args }),
    });
}

function createMethodReferencePropertyChain(typeReference: TypeReference): string[] {
    return TypeReference._visit<string[]>(typeReference, {
        named: ({ name }) => [HathoraEncoderConstants.Model.NAME, name],
        primitive: (primitive) => [HathoraEncoderConstants.Primitives.NAME, getEncoderNameForPrimitive(primitive)],
        container: (container) => [
            HathoraEncoderConstants.Containers.NAME,
            getEncoderNameForContainer(container._type),
        ],
        void: () => {
            throw new Error("Cannot encode/decode void");
        },
        _unknown: () => {
            throw new Error("Unknown type reference: " + typeReference._type);
        },
    });
}

function getArgsForMethod({
    typeReference,
    referenceToEncoder,
    args,
}: getMethodCallForModelTypeVariableReference.Args): ts.Expression[] {
    switch (args.method) {
        case "encode": {
            const argsExpressions = [args.variableToEncode];
            argsExpressions.push(...getAdditionalArgsForContainer({ typeReference, referenceToEncoder, args }));
            if (args.binSerdeWriter != null) {
                argsExpressions.push(args.binSerdeWriter);
            }
            return argsExpressions;
        }
        case "decode": {
            const argsExpressions: ts.Expression[] = [];
            argsExpressions.push(...getAdditionalArgsForContainer({ typeReference, referenceToEncoder, args }));
            argsExpressions.push(args.bufferOrBinSerdeReader);
            return argsExpressions;
        }
    }
}

function getAdditionalArgsForContainer({
    typeReference,
    referenceToEncoder,
    args,
}: getMethodCallForModelTypeVariableReference.Args): ts.Expression[] {
    if (typeReference._type !== "container") {
        return [];
    }
    return ContainerType._visit(typeReference.container, {
        list: (itemType) => {
            return getRecursiveMethodCall({ itemType, referenceToEncoder, args });
        },
        set: (itemType) => {
            return getRecursiveMethodCall({ itemType, referenceToEncoder, args });
        },
        optional: (itemType) => {
            return getRecursiveMethodCall({ itemType, referenceToEncoder, args });
        },
        map: ({ valueType }) => {
            return getRecursiveMethodCall({ itemType: valueType, referenceToEncoder, args });
        },
        _unknown: () => {
            throw new Error("Unknown container type: " + typeReference.container._type);
        },
    });
}

function getRecursiveMethodCall({
    itemType,
    referenceToEncoder,
    args,
}: {
    itemType: TypeReference;
    referenceToEncoder: ts.Expression;
    args: getMethodCallForModelTypeVariableReference.MethodCallArguments;
}): ts.Expression[] {
    switch (args.method) {
        case "encode": {
            const ITEM_PARAMETER_NAME = "item";
            const WRITER_PARAMETER_NAME = "writerForItem";
            return [
                ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(ITEM_PARAMETER_NAME)
                        ),
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(WRITER_PARAMETER_NAME)
                        ),
                    ],
                    undefined,
                    undefined,
                    getMethodCallForModelTypeVariableReference({
                        typeReference: itemType,
                        referenceToEncoder,
                        args: {
                            method: "encode",
                            variableToEncode: ts.factory.createIdentifier(ITEM_PARAMETER_NAME),
                            binSerdeWriter: ts.factory.createIdentifier(WRITER_PARAMETER_NAME),
                        },
                    })
                ),
            ];
        }
        case "decode": {
            const READER_PARAMETER_NAME = "readerForItem";
            return [
                ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(READER_PARAMETER_NAME)
                        ),
                    ],
                    undefined,
                    undefined,
                    getMethodCallForModelTypeVariableReference({
                        typeReference: itemType,
                        referenceToEncoder,
                        args: {
                            method: "decode",
                            bufferOrBinSerdeReader: ts.factory.createIdentifier(READER_PARAMETER_NAME),
                        },
                    })
                ),
            ];
        }
    }
}
