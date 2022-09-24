import { SchemaUtils } from "./SchemaUtils";

export type Schema<Raw = unknown, Parsed = unknown> = BaseSchema<Raw, Parsed> & SchemaUtils<Raw, Parsed>;

export type inferRaw<S extends Schema> = S extends Schema<infer Raw, any> ? Raw : never;
export type inferParsed<S extends Schema> = S extends Schema<any, infer Parsed> ? Parsed : never;

export interface BaseSchema<Raw, Parsed> {
    parse: (raw: Raw, opts?: SchemaOptions) => Parsed;
    json: (paresd: Parsed, opts?: SchemaOptions) => Raw;
}

export interface SchemaOptions {
    skipUnknownKeys?: boolean;
}
