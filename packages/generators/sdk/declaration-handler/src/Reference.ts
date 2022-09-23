import { ts } from "ts-morph";

export interface Reference {
    entityName: ts.EntityName;
    expression: ts.Expression;
}
