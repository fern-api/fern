import { FernAstNode, FernAstNodeImpl } from "../FernAstNode";

export interface FileTreeItemNode extends FernAstNode {
    filename: string;
}

export declare namespace FileTreeItemNodeImpl {
    export interface Init extends FernAstNodeImpl.Init {
        filename: string;
    }
}

export abstract class FileTreeItemNodeImpl extends FernAstNodeImpl implements FileTreeItemNode {
    #filename: string;

    constructor({ filename, ...superInit }: FileTreeItemNodeImpl.Init) {
        super(superInit);
        this.#filename = filename;
    }

    public override isFileTreeItemNode = (): this is FileTreeItemNode => true;

    get filename(): string {
        return this.#filename;
    }

    set filename(filename: string) {
        this.#filename = filename;
    }
}
