import { SingleUnionTypeProperty } from "@fern-fern/ir-model/types";
import { ts } from "ts-morph";
import { TypeContext } from "../contexts/TypeContext";
import { TypeSchemaContext } from "../contexts/TypeSchemaContext";
import { GeneratedUnion } from "./GeneratedUnion";

export interface GeneratedUnionType {
    type: "union";
    getGeneratedUnion: () => GeneratedUnion<TypeContext>;
    getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string;
    addVistMethodToValue: (args: { context: TypeSchemaContext; parsedValue: ts.Expression }) => ts.Expression;
    writeToFile: (context: TypeContext) => void;
}
