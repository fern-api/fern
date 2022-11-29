import { TypeContext } from "../contexts/TypeContext";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedEnumType<Context extends TypeContext = TypeContext> extends BaseGenerated<Context> {
    type: "enum";
}
