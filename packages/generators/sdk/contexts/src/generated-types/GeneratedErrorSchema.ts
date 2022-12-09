import { ts } from "ts-morph";
import { ErrorSchemaContext } from "../contexts/ErrorSchemaContext";
import { GeneratedFile } from "./BaseGenerated";

export interface GeneratedErrorSchema extends GeneratedFile<ErrorSchemaContext> {
    getReferenceToRawShape: (context: ErrorSchemaContext) => ts.TypeNode;
}
