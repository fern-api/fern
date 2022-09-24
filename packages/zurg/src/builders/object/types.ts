import { inferParsed, inferRaw, Schema } from "../../Schema";
import { ObjectLikeSchema } from "./ObjectLikeSchema";
import { Property } from "./property";

export type ObjectSchema<Raw, Parsed> = ObjectLikeSchema<Raw, Parsed>;

export type inferRawObject<T extends PropertySchemas<T>> = {
    [ParsedKey in keyof T as inferRawKey<ParsedKey, T[ParsedKey]>]: inferRawPropertySchema<T[ParsedKey]>;
};

export type inferParsedObject<T extends PropertySchemas<T>> = { [K in keyof T]: inferParsedPropertySchema<T[K]> };

export type PropertySchemas<T> = { [ParsedKey in keyof T]: Property<any, any, any> | Schema<any, any> };

export type inferRawPropertySchema<P extends Property<any, any, any> | Schema<any, any>> = P extends Property<
    any,
    infer Raw,
    any
>
    ? Raw
    : P extends Schema<any, any>
    ? inferRaw<P>
    : never;

export type inferParsedPropertySchema<P extends Property<any, any, any> | Schema<any, any>> = P extends Property<
    any,
    any,
    infer Parsed
>
    ? Parsed
    : P extends Schema<any, any>
    ? inferParsed<P>
    : never;

export type inferRawKey<
    ParsedKey extends string | number | symbol,
    P extends Property<any, any, any> | Schema<any, any>
> = P extends Property<infer Raw, any, any> ? Raw : ParsedKey;
