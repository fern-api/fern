import { WriterFunction, ts } from "ts-morph";

import { getTextOfTsKeyword } from "../codegen-utils/getTextOfTsKeyword";
import { getTextOfTsNode } from "../codegen-utils/getTextOfTsNode";

export interface TsNodeMaybeWithDocs {
    node: ts.Node;
    docs: string | null | undefined;
}

export function getWriterForMultiLineUnionType(nodes: readonly TsNodeMaybeWithDocs[]): WriterFunction {
    return (writer) => {
        if (nodes.length === 0) {
            writer.write(getTextOfTsKeyword(ts.SyntaxKind.NeverKeyword));
        } else {
            for (const { node, docs } of nodes) {
                writer.newLine();
                if (docs != null) {
                    writer.write(getTextOfTsNode(ts.factory.createJSDocComment(docs)));
                    writer.newLineIfLastNot();
                }
                writer.write(`| ${getTextOfTsNode(node)}`);
            }
        }
    };
}
