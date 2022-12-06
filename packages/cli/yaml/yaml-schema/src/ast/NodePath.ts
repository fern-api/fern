export type NodePath = readonly NodePathItem[];

export type NodePathItem = string | DetailedNodePathItem;

export interface DetailedNodePathItem {
    key: string;
    arrayIndex?: number;
}
