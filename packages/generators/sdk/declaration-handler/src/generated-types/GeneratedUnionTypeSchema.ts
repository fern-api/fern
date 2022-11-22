import { TypeSchemaContext } from "../contexts";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedUnionTypeSchema extends BaseGenerated<TypeSchemaContext> {
    type: "union";
}
