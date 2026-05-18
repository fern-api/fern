import type * as SeedApi from "../../../index.js";
export interface BinaryTreeNodeValue {
    nodeId: SeedApi.trace.NodeId;
    val: number;
    right?: (SeedApi.trace.NodeId | null) | undefined;
    left?: (SeedApi.trace.NodeId | null) | undefined;
}
