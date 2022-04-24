import { NamedType } from "@fern-api/api";
import { FernWriters, getTextOfTsKeyword, getTextOfTsNode, maybeAddDocs } from "@fern-api/typescript-commons";
import { StatementedNode, ts, Writers } from "ts-morph";

export function addBrandedTypeAlias({
    node,
    typeName,
    docs,
    baseType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
}: {
    node: StatementedNode;
    typeName: NamedType;
    docs: string | null | undefined;
    baseType?: ts.Node;
}): void {
    const typeAlias = node.addTypeAlias({
        name: typeName.name,
        isExported: true,
        type: Writers.intersectionType(
            getTextOfTsNode(baseType),
            FernWriters.object
                .writer()
                .addProperty({
                    key: `__${typeName.fernFilepath.replace(/\//g, ".")}`,
                    value: getTextOfTsKeyword(ts.SyntaxKind.VoidKeyword),
                })
                .toFunction()
        ),
    });
    maybeAddDocs(typeAlias, docs);
}
