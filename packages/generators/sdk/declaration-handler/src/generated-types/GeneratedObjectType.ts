import { ObjectProperty } from "@fern-fern/ir-model/types";
import { TypeContext } from "../contexts/TypeContext";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedObjectType extends BaseGenerated<TypeContext> {
    type: "object";
    getPropertyKey: (property: ObjectProperty) => string;
}
