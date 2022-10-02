import { FileNode } from "../file-tree/FileNode";
import { ServicesDeclarationNode } from "../services/ServicesDeclarationNode";
import { TypeDeclarationNode } from "../types/TypeDeclarationNode";

export interface FernDefinitionFile extends FileNode {
    readonly types: readonly TypeDeclarationNode[];
    readonly services: ServicesDeclarationNode;

    readonly addType: (node: TypeDeclarationNode) => void;
}
