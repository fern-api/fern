import { TypeSchemaContext } from "../contexts";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedEnumTypeSchema extends BaseGenerated<TypeSchemaContext> {
    type: "enum";
}
