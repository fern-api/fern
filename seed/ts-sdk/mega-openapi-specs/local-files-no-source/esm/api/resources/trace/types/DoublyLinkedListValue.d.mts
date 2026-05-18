import type * as SeedApi from "../../../index.mjs";
export interface DoublyLinkedListValue {
    head?: (SeedApi.trace.NodeId | null) | undefined;
    nodes: Record<string, SeedApi.trace.DoublyLinkedListNodeValue>;
}
