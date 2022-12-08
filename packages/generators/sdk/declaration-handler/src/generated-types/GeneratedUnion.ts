import { ts } from "ts-morph";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedUnion<Context> extends BaseGenerated<Context> {
    discriminant: string;
    getReferenceTo: (context: Context) => ts.TypeNode;
    build: (args: {
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
}
