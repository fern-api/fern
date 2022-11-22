import { TypeSchemaContext } from "../contexts";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedObjectTypeSchema extends BaseGenerated<TypeSchemaContext> {
    type: "object";
}
