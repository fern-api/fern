import { ts } from "ts-morph";

export interface ServiceReference {
    entityName: ts.EntityName;
    expression: ts.Expression;
}
