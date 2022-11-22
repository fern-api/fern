import { ts } from "ts-morph";
import { TypeContext } from "../contexts/TypeContext";

export interface GeneratedUnion<Context extends TypeContext> {
    discriminant: string;
    getReferenceTo: (context: Context) => ts.TypeNode;
    buildFromExistingValue: (args: {
        discriminantValueToBuild: string;
        existingValue: ts.Expression;
        context: Context;
    }) => ts.Expression;
}
