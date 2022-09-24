import { StringLiteralSchema } from "../literals/stringLiteral";
import { ObjectSchema } from "../object/types";

export type UnionSubtypes<U> = { [K in keyof U]: ObjectSchema<any, any> };

export type inferRawUnion<D extends Discriminant, U extends UnionSubtypes<U>> = {
    [K in keyof U]: Record<inferRawDiscriminant<D>, K> & (U[K] extends ObjectSchema<infer Raw, any> ? Raw : never);
}[keyof U];

export type inferParsedUnion<D extends Discriminant, U extends UnionSubtypes<U>> = {
    [K in keyof U]: Record<inferParsedDiscriminant<D>, K> &
        (U[K] extends ObjectSchema<any, infer Parsed> ? Parsed : never);
}[keyof U];

export type Discriminant = string | StringLiteralSchema<any, any>;

export type inferRawDiscriminant<D extends Discriminant> = D extends string
    ? D
    : D extends StringLiteralSchema<infer Raw, any>
    ? Raw
    : never;

export type inferParsedDiscriminant<D extends Discriminant> = D extends string
    ? D
    : D extends StringLiteralSchema<any, infer Parsed>
    ? Parsed
    : never;
