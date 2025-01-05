import { ts } from "ts-morph";

import { getTextOfTsNode } from "./getTextOfTsNode";

export function getTextOfTsKeyword(keyword: ts.KeywordTypeSyntaxKind): string {
    const node = ts.factory.createKeywordTypeNode(keyword);
    return getTextOfTsNode(node);
}
