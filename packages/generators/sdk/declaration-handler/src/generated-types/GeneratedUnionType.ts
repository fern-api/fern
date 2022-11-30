import { SingleUnionTypeProperty } from "@fern-fern/ir-model/types";
import { ts } from "ts-morph";
import { BaseGenerated } from "./BaseGenerated";
import { GeneratedUnion } from "./GeneratedUnion";

export interface GeneratedUnionType<Context> extends BaseGenerated<Context> {
    type: "union";
    getGeneratedUnion: () => GeneratedUnion<Context>;
    getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string;
    addVistMethodToValue: (args: { context: Context; parsedValue: ts.Expression }) => ts.Expression;
}
