import { TypeSchemaContext } from "../contexts";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedObjectTypeSchema<Context extends TypeSchemaContext = TypeSchemaContext>
    extends BaseGenerated<Context> {
    type: "object";
}
