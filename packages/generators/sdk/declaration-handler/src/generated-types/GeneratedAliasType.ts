import { ts } from "ts-morph";
import { TypeContext } from "../contexts/TypeContext";
import { BaseGenerated } from "./BaseGenerated";

export type GeneratedAliasType = BrandedGeneratedAliasType | NotBrandedGeneratedAliasType;

export interface BrandedGeneratedAliasType extends BaseGenerated<TypeContext> {
    type: "alias";
    isBranded: true;
    getReferenceToCreator: (context: TypeContext) => ts.Expression;
}

export interface NotBrandedGeneratedAliasType extends BaseGenerated<TypeContext> {
    type: "alias";
    isBranded: false;
}
