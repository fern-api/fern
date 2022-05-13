import { FernTypescriptHelper } from "@fern-typescript/helper-utils";

export const helper: FernTypescriptHelper = {
    encodings: {
        json: {
            _type: "inline",
            contentType: "application/json",
            generateEncode: ({ referenceToDecodedObject, ts }) => {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("JSON"),
                        ts.factory.createIdentifier("stringify")
                    ),
                    undefined,
                    [referenceToDecodedObject.variable]
                );
            },
            generateDecode: ({ referenceToEncodedBuffer, ts }) => {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("JSON"),
                        ts.factory.createIdentifier("parse")
                    ),
                    undefined,
                    [
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                referenceToEncodedBuffer.variable,
                                ts.factory.createIdentifier("toString")
                            ),
                            undefined,
                            []
                        ),
                    ]
                );
            },
        },
    },
};
