import { FernIr } from "@fern-fern/ir-sdk";
import { ts } from "ts-morph";

export interface GeneratedUnion<Context> {
    discriminant: string;
    visitPropertyName: string;
    getReferenceTo: (context: Context) => ts.TypeNode;
    /**
     * Returns base properties that should be emitted on the union, with any
     * properties already inherited via every variant's `extends` chain
     * suppressed. Lets sibling generators (e.g. the schema layer) stay in
     * sync with the type layer so the synthesized `_Base` never collides
     * with a real parent interface (TS2320).
     */
    getEffectiveBaseProperties: (context: Context) => FernIr.ObjectProperty[];
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
