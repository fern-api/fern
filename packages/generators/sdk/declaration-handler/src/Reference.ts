import { ts } from "ts-morph";

export interface Reference {
    typeNode: ts.TypeNode;
    entityName: ts.EntityName;
    expression: ts.Expression;
}
