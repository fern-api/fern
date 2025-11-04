import type { ObjectWithOptionalField } from "./ObjectWithOptionalField.mjs";
export interface NestedObjectWithOptionalField {
    string?: string;
    NestedObject?: ObjectWithOptionalField;
}
