import { SingleUnionTypeProperty } from "@fern-fern/ir-model/types";
import { ts } from "ts-morph";
import { GeneratedUnion } from "../GeneratedUnion";
import { TypeContext } from "../TypeContext";
import { TypeSchemaContext } from "../TypeSchemaContext";

export interface GeneratedUnionType {
    type: "union";
    getGeneratedUnion: () => GeneratedUnion<TypeContext>;
    getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string;
    addVistMethodToValue: (args: { context: TypeSchemaContext; parsedValue: ts.Expression }) => ts.Expression;
    writeToFile: (context: TypeContext) => void;
}
