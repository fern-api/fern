import { ObjectProperty } from "@fern-fern/ir-model/types";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedObjectType<Context> extends BaseGenerated<Context> {
    type: "object";
    getPropertyKey: (property: ObjectProperty) => string;
}
