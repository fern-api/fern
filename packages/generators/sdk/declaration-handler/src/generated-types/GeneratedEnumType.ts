import { TypeContext } from "../contexts/TypeContext";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedEnumType extends BaseGenerated<TypeContext> {
    type: "enum";
}
