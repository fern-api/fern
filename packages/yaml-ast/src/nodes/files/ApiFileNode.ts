import { FileNode } from "../file-tree/FileNode";

export interface ApiFileNode extends FileNode {
    readonly apiName: ApiNameNode;
}
