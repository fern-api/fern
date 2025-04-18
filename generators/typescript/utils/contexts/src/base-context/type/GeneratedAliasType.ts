import { ts } from "ts-morph";

import { BaseGeneratedType } from "./BaseGeneratedType";

export type GeneratedAliasType<Context> = BrandedGeneratedAliasType<Context> | NotBrandedGeneratedAliasType<Context>;

export interface BrandedGeneratedAliasType<Context> extends BaseGeneratedAliasType<Context> {
    isBranded: true;
    getReferenceToCreator: (context: Context) => ts.Expression;
}

export interface NotBrandedGeneratedAliasType<Context> extends BaseGeneratedAliasType<Context> {
    isBranded: false;
}

export interface BaseGeneratedAliasType<Context> extends BaseGeneratedType<Context> {
    type: "alias";
}
