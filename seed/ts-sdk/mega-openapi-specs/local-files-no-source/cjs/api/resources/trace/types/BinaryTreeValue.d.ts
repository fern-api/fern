import type * as SeedApi from "../../../index.js";
export interface BinaryTreeValue {
    root?: (SeedApi.trace.NodeId | null) | undefined;
    nodes: Record<string, SeedApi.trace.BinaryTreeNodeValue>;
}
