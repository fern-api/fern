import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { convertRecordToIndexSignature } from "../convertRecordToIndexSignature.js";
import { getTextOfTsNode } from "../getTextOfTsNode.js";

function record(keyType: ts.TypeNode, valueType: ts.TypeNode): ts.TypeNode {
    return ts.factory.createTypeReferenceNode("Record", [keyType, valueType]);
}

describe("convertRecordToIndexSignature", () => {
    it("converts a string-keyed Record to an index signature", () => {
        const converted = convertRecordToIndexSignature(
            record(
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                ts.factory.createTypeReferenceNode("Node")
            )
        );
        expect(getTextOfTsNode(converted)).toBe("{\n    [key: string]: Node;\n}");
    });

    it("keeps a Record with non-string keys", () => {
        const keyType = ts.factory.createUnionTypeNode([
            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral("a")),
            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral("b"))
        ]);
        const typeNode = record(keyType, ts.factory.createTypeReferenceNode("Node"));
        expect(convertRecordToIndexSignature(typeNode)).toBe(typeNode);
    });

    it("keeps types that aren't a Record", () => {
        const typeNode = ts.factory.createArrayTypeNode(ts.factory.createTypeReferenceNode("Node"));
        expect(convertRecordToIndexSignature(typeNode)).toBe(typeNode);
    });
});
