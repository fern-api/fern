import { ts } from "ts-morph";
import { BaseContext } from "../contexts";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedUnion<Context extends BaseContext> extends BaseGenerated<Context> {
    discriminant: string;
    getReferenceTo: (context: Context) => ts.TypeNode;
    buildFromExistingValue: (args: {
        discriminantValueToBuild: string;
        existingValue: ts.Expression;
        context: Context;
    }) => ts.Expression;
}
