import { FileTreeItemNode, FileTreeItemNodeImpl } from "./FileTreeItemNode";

export interface FolderNode extends FileTreeItemNode {
    readonly contents: readonly FileTreeItemNode[];
    readonly insertItem: (index: number, item: FileTreeItemNode) => void;
    readonly deleteItem: (index: number) => void;
}

export declare namespace FolderNodeImpl {
    export interface Init extends FileTreeItemNodeImpl.Init {
        contents: FileTreeItemNode[];
    }
}

export class FolderNodeImpl extends FileTreeItemNodeImpl implements FolderNode {
    #contents: FileTreeItemNode[];

    constructor({ contents, ...superInit }: FolderNodeImpl.Init) {
        super(superInit);
        this.#contents = contents;
    }

    public override isFolderNode = (): this is FolderNode => true;

    get contents(): readonly FileTreeItemNode[] {
        return this.#contents;
    }

    public insertItem(index: number, content: FileTreeItemNode): void {
        if (index < 0) {
            throw new Error(`Cannot insert file tree item at negative index ${index}`);
        }
        if (index > this.#contents.length) {
            throw new Error(
                `Cannot insert file tree item at index ${index} because there are only ${this.#contents.length} items`
            );
        }
        this.#contents.splice(index, 0, content);
    }

    public deleteItem(index: number): void {
        if (index < 0) {
            throw new Error(`Cannot delete file tree item at negative index ${index}`);
        }
        if (index >= this.#contents.length) {
            throw new Error(
                `Cannot insert file tree item at index ${index} because there are only ${this.contents.length} items`
            );
        }
        this.#contents.splice(index, 1);
    }
}
