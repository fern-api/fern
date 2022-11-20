import { SingleUnionTypeProperty } from "@fern-fern/ir-model/types";
import { ts } from "ts-morph";
import { GeneratedUnion } from "../GeneratedUnion";
import { TypeContext } from "../TypeContext";
import { TypeSchemaContext } from "../TypeSchemaContext";
import { GeneratedType } from "./GeneratedType";

export interface GeneratedUnionType extends GeneratedType {
    getGeneratedUnion: () => GeneratedUnion<TypeContext>;
    getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string;
    addVistMethodToValue: (args: { context: TypeSchemaContext; parsedValue: ts.Expression }) => ts.Expression;
}
