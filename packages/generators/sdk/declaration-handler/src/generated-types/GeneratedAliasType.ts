import { ts } from "ts-morph";
import { TypeContext } from "../contexts/TypeContext";

export type GeneratedAliasType = BrandedGeneratedAliasType | NotBrandedGeneratedAliasType;

export interface BrandedGeneratedAliasType {
    type: "alias";
    isBranded: true;
    getReferenceToCreator: (context: TypeContext) => ts.Expression;
    writeToFile: (context: TypeContext) => void;
}

export interface NotBrandedGeneratedAliasType {
    type: "alias";
    isBranded: false;
    writeToFile: (context: TypeContext) => void;
}
