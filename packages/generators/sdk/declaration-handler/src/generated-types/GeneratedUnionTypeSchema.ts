import { TypeSchemaContext } from "../contexts";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedUnionTypeSchema<Context extends TypeSchemaContext = TypeSchemaContext>
    extends BaseGenerated<Context> {
    type: "union";
}
