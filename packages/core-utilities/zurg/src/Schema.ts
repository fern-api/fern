import { SchemaUtils } from "./builders";
import { MaybePromise } from "./utils/MaybePromise";

export type Schema<Raw = unknown, Parsed = unknown> = BaseSchema<Raw, Parsed> & SchemaUtils<Raw, Parsed>;

export type inferRaw<S extends Schema> = S extends Schema<infer Raw, any> ? Raw : never;
export type inferParsed<S extends Schema> = S extends Schema<any, infer Parsed> ? Parsed : never;

export interface BaseSchema<Raw, Parsed> {
    parse: (raw: unknown, opts?: SchemaOptions) => MaybePromise<MaybeValid<Parsed>>;
    json: (parsed: unknown, opts?: SchemaOptions) => MaybePromise<MaybeValid<Raw>>;
    getType: () => SchemaType | Promise<SchemaType>;
}

export const SchemaType = {
    DATE: "date",
    ENUM: "enum",
    LIST: "list",
    STRING_LITERAL: "stringLiteral",
    OBJECT: "object",
    ANY: "any",
    BOOLEAN: "boolean",
    NUMBER: "number",
    STRING: "string",
    UNKNOWN: "unknown",
    RECORD: "record",
    SET: "set",
    UNION: "union",
    UNDISCRIMINATED_UNION: "undiscriminatedUnion",
    OPTIONAL: "optional",
} as const;
export type SchemaType = typeof SchemaType[keyof typeof SchemaType];

export type MaybeValid<T> = Valid<T> | Invalid;

export interface Valid<T> {
    ok: true;
    value: T;
}

export interface Invalid {
    ok: false;
    errors: ValidationError[];
}

export interface ValidationError {
    path: string[];
    message: string;
}

export interface SchemaOptions {
    /**
     * how to handle unrecognized keys in objects
     *
     * @default "fail"
     */
    unrecognizedObjectKeys?: "fail" | "passthrough" | "strip";

    /**
     * whether to fail when an unrecognized discriminant value is
     * encountered in a union
     *
     * @default false
     */
    allowUnrecognizedUnionMembers?: boolean;

    /**
     * whether to fail when an unrecognized enum value is encountered
     *
     * @default false
     */
    allowUnrecognizedEnumValues?: boolean;
}
