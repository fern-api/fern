import { ts } from "ts-morph";

export interface GeneratedUnion<Context> {
    discriminant: string;
    visitPropertyName: string;
    getReferenceTo: (context: Context) => ts.TypeNode;
    build: (args: {
        discriminantValueToBuild: string | number;
        builderArgument: ts.Expression | undefined;
        nonDiscriminantProperties: ts.ObjectLiteralElementLike[];
        context: Context;
    }) => ts.Expression;
    buildWithBuilder: (args: {
        discriminantValueToBuild: string | number;
        builderArgument: ts.Expression | undefined;
        context: Context;
    }) => ts.Expression;
    buildFromExistingValue: (args: {
        discriminantValueToBuild: string | number;
        existingValue: ts.Expression;
        context: Context;
    }) => ts.Expression;
    buildUnknown: (args: { existingValue: ts.Expression; context: Context }) => ts.Expression;
    getUnknownDiscriminantValueType: () => ts.TypeNode;
    getBasePropertyKey: (rawKey: string) => string;
}
