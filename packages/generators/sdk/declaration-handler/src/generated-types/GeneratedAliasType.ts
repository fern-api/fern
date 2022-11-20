import { ts } from "ts-morph";
import { TypeContext } from "../TypeContext";
import { GeneratedType } from "./GeneratedType";

export type GeneratedAliasType = BrandedGeneratedAliasType | NotBrandedGeneratedAliasType;

export interface BrandedGeneratedAliasType extends GeneratedType {
    isBranded: true;
    getReferenceToCreator: (context: TypeContext) => ts.Expression;
}

export interface NotBrandedGeneratedAliasType extends GeneratedType {
    isBranded: false;
}
