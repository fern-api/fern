import { FileTreeItemNode, FileTreeItemNodeImpl } from "./FileTreeItemNode";

export interface FileNode extends FileTreeItemNode {
    readonly types: readonly TypeDeclarationNode[];
}

export declare namespace FileNodeImpl {
    export type Init = FileTreeItemNodeImpl.Init;
}

export class FileNodeImpl extends FileTreeItemNodeImpl implements FileNode {
    types: readonly TypeDeclarationNode[];
    public override isFileNode = (): this is FileNode => true;
}
