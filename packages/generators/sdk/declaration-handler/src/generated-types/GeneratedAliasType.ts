import { ts } from "ts-morph";
import { BaseGenerated } from "./BaseGenerated";

export type GeneratedAliasType<Context> = BrandedGeneratedAliasType<Context> | NotBrandedGeneratedAliasType<Context>;

export interface BrandedGeneratedAliasType<Context> extends BaseGenerated<Context> {
    type: "alias";
    isBranded: true;
    getReferenceToCreator: (context: Context) => ts.Expression;
}

export interface NotBrandedGeneratedAliasType<Context> extends BaseGenerated<Context> {
    type: "alias";
    isBranded: false;
}
