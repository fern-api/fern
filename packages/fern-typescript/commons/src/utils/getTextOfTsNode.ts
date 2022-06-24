import { ts } from "ts-morph";

const SOURCE_FILE = ts.factory.createSourceFile(
    [],
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
);

export function getTextOfTsNode(node: ts.Node): string {
    return ts.createPrinter().printNode(ts.EmitHint.Unspecified, node, SOURCE_FILE);
}
