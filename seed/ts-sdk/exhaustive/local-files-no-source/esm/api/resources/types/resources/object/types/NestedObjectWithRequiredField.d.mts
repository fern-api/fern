import type { ObjectWithOptionalField } from "./ObjectWithOptionalField.mjs";
export interface NestedObjectWithRequiredField {
    string: string;
    NestedObject: ObjectWithOptionalField;
}
