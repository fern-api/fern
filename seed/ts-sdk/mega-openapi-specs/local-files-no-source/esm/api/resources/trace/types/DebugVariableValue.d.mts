import type * as SeedApi from "../../../index.mjs";
export type DebugVariableValue = {
    type: "integerValue";
    value?: number | undefined;
} | {
    type: "booleanValue";
    value?: boolean | undefined;
} | {
    type: "doubleValue";
    value?: number | undefined;
} | {
    type: "stringValue";
    value?: string | undefined;
} | {
    type: "charValue";
    value?: string | undefined;
} | {
    type: "mapValue";
} | {
    type: "listValue";
    value?: SeedApi.trace.DebugVariableValue[] | undefined;
} | {
    type: "binaryTreeNodeValue";
} | {
    type: "singlyLinkedListNodeValue";
} | {
    type: "doublyLinkedListNodeValue";
} | {
    type: "undefinedValue";
} | {
    type: "nullValue";
} | {
    type: "genericValue";
};
