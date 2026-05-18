import type * as SeedApi from "../../../index.mjs";
export interface DoublyLinkedListNodeValue {
    nodeId: SeedApi.trace.NodeId;
    val: number;
    next?: (SeedApi.trace.NodeId | null) | undefined;
    prev?: (SeedApi.trace.NodeId | null) | undefined;
}
