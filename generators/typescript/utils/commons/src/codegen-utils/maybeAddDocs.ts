import { JSDocableNode, JSDocableNodeStructure } from "ts-morph";

export function maybeAddDocsNode(node: JSDocableNode, docs: string | null | undefined): void {
    if (docs != null) {
        docs = "\n" + docs;
        node.addJsDoc(docs);
    }
}

export function maybeAddDocsStructure(node: JSDocableNodeStructure, docs: string | null | undefined): void {
    if (docs != null) {
        docs = "\n" + docs;
        // add newline so ts-morph makes it a multiline comment
        node.docs = [docs];
        return;
    }
}
