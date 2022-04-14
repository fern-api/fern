import { TypeName } from "@fernapi/ir-generation";
import { FernWriters } from "@fernapi/typescript-commons";
import { StatementedNode, ts, Writers } from "ts-morph";
import { getTextOfTsKeyword } from "./getTextOfTsKeyword";
import { getTextOfTsNode } from "./getTextOfTsNode";
import { maybeAddDocs } from "./maybeAddDocs";

export function addBrandedTypeAlias({
    node,
    typeName,
    docs,
    baseType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
}: {
    node: StatementedNode;
    typeName: TypeName;
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
