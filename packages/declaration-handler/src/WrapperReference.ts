import { ts } from "ts-morph";

export interface WrapperReference {
    entityName: ts.EntityName;
    expression: ts.Expression;
}
