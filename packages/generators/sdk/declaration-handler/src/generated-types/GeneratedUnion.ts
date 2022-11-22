import { ts } from "ts-morph";
import { TypeContext } from "../contexts/TypeContext";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedUnion<Context extends TypeContext> extends BaseGenerated<Context> {
    discriminant: string;
    getReferenceTo: (context: Context) => ts.TypeNode;
    buildFromExistingValue: (args: {
        discriminantValueToBuild: string;
        existingValue: ts.Expression;
        context: Context;
    }) => ts.Expression;
}
