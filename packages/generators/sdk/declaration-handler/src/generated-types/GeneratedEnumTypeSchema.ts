import { TypeSchemaContext } from "../contexts";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedEnumTypeSchema<Context extends TypeSchemaContext = TypeSchemaContext>
    extends BaseGenerated<Context> {
    type: "enum";
}
