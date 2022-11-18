import { ts } from "ts-morph";

export interface Reference {
    getExpression: () => ts.Expression;
    getTypeNode: () => ts.TypeNode;
    getEntityName: () => ts.EntityName;
}
