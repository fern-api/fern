import type * as SeedApi from "../../../index.mjs";
export interface SinglyLinkedListValue {
    head?: (SeedApi.trace.NodeId | null) | undefined;
    nodes: Record<string, SeedApi.trace.SinglyLinkedListNodeValue>;
}
