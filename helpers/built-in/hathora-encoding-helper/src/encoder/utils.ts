import { ts } from "@fern-typescript/helper-utils";
import { EncodeMethods } from "./constructEncodeMethods";

export const NOT_IMPLEMENTED_ENCODE_METHODS: EncodeMethods = {
    decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
    encode: {
        statements: [
            ts.factory.createThrowStatement(
                ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
                    ts.factory.createStringLiteral("Not implemented."),
                ])
            ),
        ],
    },
    decode: {
        statements: [
            ts.factory.createThrowStatement(
                ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
                    ts.factory.createStringLiteral("Not implemented."),
                ])
            ),
        ],
    },
};
