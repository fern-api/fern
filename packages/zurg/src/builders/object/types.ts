import { inferParsed, inferRaw, Schema } from "../../Schema";
import { addQuestionMarksToNullableProperties } from "../../utils/addQuestionMarksToNullableProperties";
import { BaseObjectLikeSchema, ObjectLikeSchema } from "../object-like";
import { Property } from "./property";

export type ObjectSchema<Raw, Parsed> = BaseObjectSchema<Raw, Parsed> &
    ObjectLikeSchema<Raw, Parsed> &
    ObjectUtils<Raw, Parsed>;

export type BaseObjectSchema<Raw, Parsed> = BaseObjectLikeSchema<Raw, Parsed>;

export interface ObjectUtils<Raw, Parsed> {
    extend: <U extends PropertySchemas<keyof U>>(
        schemas: U
    ) => ObjectSchema<Raw & inferRawObjectFromPropertySchemas<U>, Parsed & inferParsedObjectFromPropertySchemas<U>>;
}

export type inferRawObject<O extends ObjectSchema<any, any>> = O extends ObjectSchema<infer Raw, any> ? Raw : never;

export type inferParsedObject<O extends ObjectSchema<any, any>> = O extends ObjectSchema<any, infer Parsed>
    ? Parsed
    : never;

export type inferObjectSchemaFromPropertySchemas<T extends PropertySchemas<keyof T>> = ObjectSchema<
    inferRawObjectFromPropertySchemas<T>,
    inferParsedObjectFromPropertySchemas<T>
>;

export type inferRawObjectFromPropertySchemas<T extends PropertySchemas<keyof T>> =
    addQuestionMarksToNullableProperties<{
        [ParsedKey in keyof T as inferRawKey<ParsedKey, T[ParsedKey]>]: inferRawPropertySchema<T[ParsedKey]>;
    }>;

export type inferParsedObjectFromPropertySchemas<T extends PropertySchemas<keyof T>> =
    addQuestionMarksToNullableProperties<{
        [K in keyof T]: inferParsedPropertySchema<T[K]>;
    }>;

export type PropertySchemas<ParsedKeys extends string | number | symbol> = Record<
    ParsedKeys,
    Property<any, any, any> | Schema<any, any>
>;

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
