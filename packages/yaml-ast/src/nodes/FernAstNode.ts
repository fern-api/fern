import { ApiNode } from "./ApiNode";
import { FileNode } from "./file-tree/FileNode";
import { FileTreeItemNode } from "./file-tree/FileTreeItemNode";
import { FolderNode } from "./file-tree/FolderNode";
import { ApiFileNode } from "./files/ApiFileNode";
import { FernFileTreeItemNode } from "./files/FernFileTreeItemNode";
import { ServiceFileNode } from "./files/ServiceFileNode";
import { TypeDeclarationNode } from "./types/TypeDeclarationNode";

export interface FernAstNode {
    readonly isApiNode: () => this is ApiNode;
    readonly isApiFileNode: () => this is ApiFileNode;
    readonly isFileNode: () => this is FileNode;
    readonly isFileTreeItemNode: () => this is FileTreeItemNode;
    readonly isFolderNode: () => this is FolderNode;
    readonly isFernFileTreeItemNode: () => this is FernFileTreeItemNode;
    readonly isServiceFileNode: () => this is ServiceFileNode;
    readonly isTypeDeclarationNode: () => this is TypeDeclarationNode;
}

export declare namespace FernAstNodeImpl {
    // adding an empty Init for subtypes to extend
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface Init {}
}

export abstract class FernAstNodeImpl implements FernAstNode {
    // adding a useless constructor so that it's easy to add a parameter later
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
    constructor(_init: FernAstNodeImpl.Init) {}

    public readonly isApiNode = (): this is ApiNode => false;
    public readonly isApiFileNode = (): this is ApiFileNode => false;
    public readonly isFileNode = (): this is FileNode => false;
    public readonly isFileTreeItemNode = (): this is FileTreeItemNode => false;
    public readonly isFolderNode = (): this is FolderNode => false;
    public readonly isFernFileTreeItemNode = (): this is FernFileTreeItemNode => false;
    public readonly isServiceFileNode = (): this is ServiceFileNode => false;
    public readonly isTypeDeclarationNode = (): this is TypeDeclarationNode => false;
}
