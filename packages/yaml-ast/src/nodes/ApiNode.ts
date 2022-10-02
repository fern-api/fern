import { ApiFileNode } from "./files/ApiFileNode";
import { FernFileTreeItemNode } from "./files/FernFileTreeItemNode";

export interface ApiNode {
    readonly apiFile: ApiFileNode;
    readonly fileTreeItems: FernFileTreeItemNode[];

    readonly insertFileTree: (index: number, fileTreeNode: FileTreeNode) => void;
    readonly deleteContent: (index: number) => void;
}
