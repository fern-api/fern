import type * as SeedApi from "../../../index.mjs";
export interface SinglyLinkedListNodeValue {
    nodeId: SeedApi.trace.NodeId;
    val: number;
    next?: (SeedApi.trace.NodeId | null) | undefined;
}
