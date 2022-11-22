import { ObjectProperty } from "@fern-fern/ir-model/types";
import { TypeContext } from "../contexts/TypeContext";

export interface GeneratedObjectType {
    type: "object";
    getPropertyKey: (property: ObjectProperty) => string;
    writeToFile: (context: TypeContext) => void;
}
