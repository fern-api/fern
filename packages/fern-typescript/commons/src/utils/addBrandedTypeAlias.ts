import { StatementedNode, ts, Writers } from "ts-morph";
import { getTextOfTsNode } from "./getTextOfTsNode";
import { maybeAddDocs } from "./maybeAddDocs";

export function addBrandedTypeAlias({
    node,
    typeName,
    docs,
    baseType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
}: {
    node: StatementedNode;
    typeName: string;
    docs: string | null | undefined;
    baseType?: ts.Node;
}): void {
    const typeAlias = node.addTypeAlias({
        name: typeName,
        isExported: true,
        type: Writers.intersectionType(
            getTextOfTsNode(baseType),
            getTextOfTsNode(
                ts.factory.createTypeLiteralNode([
                    ts.factory.createPropertySignature(
                        undefined,
                        ts.factory.createIdentifier(`__${typeName}`),
                        undefined,
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                    ),
                ])
            )
        ),
    });
    maybeAddDocs(typeAlias, docs);
}
