import { ts } from "ts-morph";
import { GeneratedFile } from "./GeneratedFile";

export interface GeneratedUnion<Context> extends GeneratedFile<Context> {
    discriminant: string;
    visitPropertyName: string;
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
    getUnknownDiscriminantValueType: () => ts.TypeNode;
}
