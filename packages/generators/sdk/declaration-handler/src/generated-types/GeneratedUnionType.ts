import { SingleUnionTypeProperty } from "@fern-fern/ir-model/types";
import { ts } from "ts-morph";
import { TypeContext } from "../contexts/TypeContext";
import { BaseGenerated } from "./BaseGenerated";
import { GeneratedUnion } from "./GeneratedUnion";

export interface GeneratedUnionType<Context extends TypeContext = TypeContext> extends BaseGenerated<Context> {
    type: "union";
    getGeneratedUnion: () => GeneratedUnion<Context>;
    getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string;
    addVistMethodToValue: (args: { context: Context; parsedValue: ts.Expression }) => ts.Expression;
}
