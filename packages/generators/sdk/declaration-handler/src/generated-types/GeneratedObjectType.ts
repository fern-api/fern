import { ObjectProperty } from "@fern-fern/ir-model/types";
import { TypeContext } from "../contexts/TypeContext";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedObjectType<Context extends TypeContext = TypeContext> extends BaseGenerated<Context> {
    type: "object";
    getPropertyKey: (property: ObjectProperty) => string;
}
