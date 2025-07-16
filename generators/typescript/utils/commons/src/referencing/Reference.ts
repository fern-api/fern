import { ts } from "ts-morph";

export interface Reference {
    getExpression: (opts?: GetReferenceOpts) => ts.Expression;
    getTypeNode: (opts?: GetReferenceOpts) => ts.TypeNode;
    getEntityName: (opts?: GetReferenceOpts) => ts.EntityName;
}

export interface GetReferenceOpts {
    isForTypeDeclarationComment?: boolean;
    isForComment?: boolean;
    isForSnippet?: boolean;
}
