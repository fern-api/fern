import type { ObjectWithOptionalField } from "./ObjectWithOptionalField.js";
export interface NestedObjectWithOptionalField {
    string?: string;
    NestedObject?: ObjectWithOptionalField;
}
