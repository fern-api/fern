import { FileTreeItemNode, FileTreeItemNodeImpl } from "../file-tree/FileTreeItemNode";

export type FernFileTreeItemNode = FileTreeItemNode;

export declare namespace FernFileTreeItemNodeImpl {
    export type Init = FileTreeItemNodeImpl.Init;
}

export abstract class FernFileTreeItemNodeImpl extends FileTreeItemNodeImpl implements FernFileTreeItemNode {
    public override isFernFileTreeItemNode = (): this is FernFileTreeItemNode => true;
}
