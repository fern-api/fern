import { ts } from "ts-morph";

const SOURCE_FILE = ts.factory.createSourceFile(
    [],
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
);

const PRINTER = ts.createPrinter();

export function getTextOfTsNode(node: ts.Node): string {
    return PRINTER.printNode(ts.EmitHint.Unspecified, node, SOURCE_FILE);
}
