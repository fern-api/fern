import { tsMorph } from "./types/tsMorph";

export function createPrinter({ ts }: typeof tsMorph): (node: tsMorph.ts.Node) => string {
    const SOURCE_FILE = ts.factory.createSourceFile(
        [],
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None
    );

    return (node: tsMorph.ts.Node) => ts.createPrinter().printNode(ts.EmitHint.Unspecified, node, SOURCE_FILE);
}
