import { FernTypescriptHelper, ts } from "@fern-typescript/helper-utils";

export const helper: FernTypescriptHelper = {
    encodings: {
        json: {
            _type: "inline",
            contentType: "application/json",
            generateEncode: ({ referenceToDecodedObject }) => {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("JSON"),
                        ts.factory.createIdentifier("stringify")
                    ),
                    undefined,
                    [referenceToDecodedObject.variable]
                );
            },
            generateDecode: ({ referenceToEncodedBuffer }) => {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("JSON"),
                        ts.factory.createIdentifier("parse")
                    ),
                    undefined,
                    [
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createNewExpression(
                                    ts.factory.createIdentifier("TextDecoder"),
                                    undefined,
                                    []
                                ),
                                ts.factory.createIdentifier("decode")
                            ),
                            undefined,
                            [referenceToEncodedBuffer.variable]
                        ),
                    ]
                );
            },
        },
    },
};
