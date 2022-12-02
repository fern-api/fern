import { ts } from "ts-morph";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedUnion<Context> extends BaseGenerated<Context> {
    discriminant: string;
    getReferenceTo: (context: Context) => ts.TypeNode;
    buildFromExistingValue: (args: {
        discriminantValueToBuild: string;
        existingValue: ts.Expression;
        context: Context;
    }) => ts.Expression;
    buildUnknown: (args: { existingValue: ts.Expression; context: Context }) => ts.Expression;
}
