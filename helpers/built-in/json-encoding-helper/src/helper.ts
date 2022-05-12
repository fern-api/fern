import { FernTypescriptHelper } from "@fern-typescript/helper-commons";

export const helper: FernTypescriptHelper = {
    encodings: {
        json: {
            contentType: "application/json",
            generateEncode: ({ referenceToDecoded, factory }) => {
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("JSON"),
                        factory.createIdentifier("stringify")
                    ),
                    undefined,
                    [referenceToDecoded]
                );
            },
            generateDecode: ({ referenceToEncodedBuffer, factory }) => {
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("JSON"),
                        factory.createIdentifier("parse")
                    ),
                    undefined,
                    [
                        factory.createCallExpression(
                            factory.createPropertyAccessExpression(
                                referenceToEncodedBuffer,
                                factory.createIdentifier("toString")
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
