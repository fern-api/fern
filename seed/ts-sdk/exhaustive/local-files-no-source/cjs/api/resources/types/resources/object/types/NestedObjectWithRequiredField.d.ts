import type { ObjectWithOptionalField } from "./ObjectWithOptionalField.js";
export interface NestedObjectWithRequiredField {
    string: string;
    NestedObject: ObjectWithOptionalField;
}
