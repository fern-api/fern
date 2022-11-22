import { TypeSchemaContext } from "../contexts";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedAliasTypeSchema extends BaseGenerated<TypeSchemaContext> {
    type: "alias";
}
