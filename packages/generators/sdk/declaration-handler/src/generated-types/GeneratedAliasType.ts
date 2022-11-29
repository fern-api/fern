import { ts } from "ts-morph";
import { TypeContext } from "../contexts/TypeContext";
import { BaseGenerated } from "./BaseGenerated";

export type GeneratedAliasType<Context extends TypeContext = TypeContext> =
    | BrandedGeneratedAliasType<Context>
    | NotBrandedGeneratedAliasType<Context>;

export interface BrandedGeneratedAliasType<Context extends TypeContext = TypeContext> extends BaseGenerated<Context> {
    type: "alias";
    isBranded: true;
    getReferenceToCreator: (context: Context) => ts.Expression;
}

export interface NotBrandedGeneratedAliasType<Context extends TypeContext = TypeContext>
    extends BaseGenerated<Context> {
    type: "alias";
    isBranded: false;
}
