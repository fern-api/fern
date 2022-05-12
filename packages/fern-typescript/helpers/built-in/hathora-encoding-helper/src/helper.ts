import { FernTypescriptHelper } from "@fern-typescript/helper-commons";
import ts from "typescript";

export const helper: FernTypescriptHelper = {
    encodings: {
        hathora: {
            contentType: "application/json",
            generateEncode: ({ referenceToDecoded }) => {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("JSON"),
                        ts.factory.createIdentifier("stringify")
                    ),
                    undefined,
                    [referenceToDecoded]
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
                                referenceToEncodedBuffer,
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
