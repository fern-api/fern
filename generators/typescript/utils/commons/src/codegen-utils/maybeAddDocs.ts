import { JSDocableNode, JSDocableNodeStructure } from "ts-morph";

export function maybeAddDocs(node: JSDocableNodeStructure | JSDocableNode, docs: string | null | undefined): void {
    if (docs != null) {
        docs = "\n" + docs;
        if ("docs" in node) {
            // add newline so ts-morph makes it a multiline comment
            node.docs = [docs];
            return;
        } else if ("addJsDoc" in node) {
            node.addJsDoc(docs);
        }
    }
}
