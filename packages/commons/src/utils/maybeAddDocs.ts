import { JSDocableNode } from "ts-morph";

export function maybeAddDocs(node: JSDocableNode, docs: string | null | undefined): void {
    if (docs != null) {
        // add newline so ts-morph makes it a multiline comment
        node.addJsDoc("\n" + docs);
    }
}
