import { TypeSchemaContext } from "../contexts";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedAliasTypeSchema<Context extends TypeSchemaContext = TypeSchemaContext>
    extends BaseGenerated<Context> {
    type: "alias";
}
