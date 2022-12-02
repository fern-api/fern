import { ts } from "ts-morph";
import { ErrorSchemaContext } from "../contexts/ErrorSchemaContext";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedErrorSchema extends BaseGenerated<ErrorSchemaContext> {
    getReferenceToRawShape: (context: ErrorSchemaContext) => ts.TypeNode;
}
