import { ObjectProperty } from "@fern-fern/ir-model/types";
import { GeneratedType } from "./GeneratedType";

export interface GeneratedObjectType extends GeneratedType {
    getPropertyKey: (property: ObjectProperty) => string;
}
