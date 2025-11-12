import { fail } from "node:assert";
import { Literal } from "../ast/code/Literal";
import { AstNode } from "../ast/core/AstNode";
import { ClassReference } from "../ast/types/ClassReference";
import { BaseType, Collection, Optional, Primitive, Type, Value } from "../ast/types/Type";
import { type Provenance } from "../context/model-navigator";
import { is as DynamicIR } from "./dynamic-ir-type-guards";
import { is as IR } from "./ir-type-guards";

const ISO_8601_DATE_REGEX = /^[+-]?\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])$/;

const ISO_8601_DATE_TIME_REGEX =
    /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))[T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\16[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)$/;

/** Universal Type Guard functions
 *
 * Using these functions on objects is preferable to sniffing the internals of the object.
 * Using the type guard functions allows TypeScript to infer the type of the object in the block following.
 *
 * @see https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-guards
 */
export const is = {
    string: (value: unknown): value is string => typeof value === "string",
    boolean: (value: unknown): value is boolean => typeof value === "boolean",
    number: (value: unknown): value is number => typeof value === "number",
    date: (value: unknown): value is Date => value instanceof Date,
    object: (value: unknown): value is object =>
        value != null && typeof value === "object" && Array.isArray(value) === false,
    array: (value: unknown): value is unknown[] => Array.isArray(value),
    Provenance: (value: unknown): value is Provenance =>
        is.object(value) && "jsonPath" in value && "name" in value && "node" in value,
    Explicit: (value: unknown): value is Provenance & { explicit: true } =>
        is.Provenance(value) && value.explicit === true,
    NonNullable: <T>(value: T): value is NonNullable<T> => value != null,
    isIsoDateString: (value: unknown): value is string => is.string(value) && ISO_8601_DATE_REGEX.test(value),
    isIsoDateTimeString: (value: unknown): value is string => is.string(value) && ISO_8601_DATE_TIME_REGEX.test(value),
    Type: (value: unknown): value is BaseType => value instanceof BaseType,
    ClassReference: (value: unknown): value is ClassReference => value instanceof ClassReference,
    Optional: (value: Type): value is Optional => value instanceof Optional,
    Record: {
        empty: (value: unknown): value is Record<string, unknown> =>
            value == null || Object.keys(value || {}).length === 0,
        nonEmpty: (value: unknown): value is Record<string, unknown> =>
            is.object(value) && Object.keys(value).length > 0,
        withKey: <K extends string>(value: unknown, key: K): value is Record<K, unknown> =>
            is.object(value) && key in value,
        missingKey: <K extends string>(value: unknown, key: K): value is Record<K, unknown> =>
            is.object(value) && !(key in value)
    },

    Ast: {
        Node: (value: unknown) => value instanceof AstNode,
        NamedNode: (value: unknown): value is AstNode & { name: string } =>
            is.Ast.Node(value) && "name" in value && typeof value.name === "string"
    },
    OneOf: {
        OneOf: (value: Type | undefined): value is ClassReference =>
            is.ClassReference(value) && value.fullyQualifiedName === "OneOf.OneOf",
        OneOfBase: (value: Type | undefined): value is ClassReference =>
            is.ClassReference(value) && value.fullyQualifiedName === "OneOf.OneOfBase"
    },

    Primitive: {
        string: (value: Type | undefined) => value instanceof Primitive.String,
        boolean: (value: Type | undefined) => value instanceof Primitive.Boolean,
        int: (value: Type | undefined) => value instanceof Primitive.Integer,
        long: (value: Type | undefined) => value instanceof Primitive.Long,
        uint: (value: Type | undefined) => value instanceof Primitive.Uint,
        ulong: (value: Type | undefined) => value instanceof Primitive.ULong,
        float: (value: Type | undefined) => value instanceof Primitive.Float,
        double: (value: Type | undefined) => value instanceof Primitive.Double,
        object: (value: Type | undefined) => value instanceof Primitive.Object
    },

    Value: {
        dateTime: (value: Type | undefined) => value instanceof Value.DateTime,
        uuid: (value: Type | undefined) => value instanceof Value.Uuid,
        byte: (value: Type | undefined) => value instanceof Value.Binary,
        stringEnum: (value: Type | undefined) => value instanceof Value.StringEnum
    },

    Collection: {
        array: (value: Type | undefined) => value instanceof Collection.Array,
        listType: (value: Type | undefined) => value instanceof Collection.ListType,
        list: (value: Type | undefined) => value instanceof Collection.List,
        set: (value: Type | undefined) => value instanceof Collection.Set,
        map: (value: Type | undefined) => value instanceof Collection.Map,
        idictionary: (value: Type | undefined) => value instanceof Collection.IDictionary,
        keyValuePair: (value: Type | undefined) => value instanceof Collection.KeyValuePair
    },

    Literal: {
        string: (value: Literal | undefined) => value instanceof Literal.String,
        boolean: (value: Literal | undefined) => value instanceof Literal.Boolean,
        decimal: (value: Literal | undefined) => value instanceof Literal.Decimal,
        double: (value: Literal | undefined) => value instanceof Literal.Double,
        date: (value: Literal | undefined) => value instanceof Literal.Date,
        dateTime: (value: Literal | undefined) => value instanceof Literal.DateTime,
        float: (value: Literal | undefined) => value instanceof Literal.Float,
        int: (value: Literal | undefined) => value instanceof Literal.Integer,
        long: (value: Literal | undefined) => value instanceof Literal.Long,
        uint: (value: Literal | undefined) => value instanceof Literal.Uint,
        ulong: (value: Literal | undefined) => value instanceof Literal.Ulong,
        class: (value: Literal | undefined) => value instanceof Literal.Class_,
        list: (value: Literal | undefined) => value instanceof Literal.List,
        set: (value: Literal | undefined) => value instanceof Literal.Set,
        dictionary: (value: Literal | undefined) => value instanceof Literal.Dictionary,
        nop: (value: Literal | undefined) => value instanceof Literal.Nop,
        null: (value: Literal | undefined) => value instanceof Literal.Null,
        unknown: (value: Literal | undefined) => value instanceof Literal.Unknown
    },

    IR, // Intermediate Representation typeguards
    DynamicIR // Dynamic IR typeguards
};

export const assert = {
    object: (value: unknown): value is object => {
        return is.object(value) || fail(`Not an object type: ${JSON.stringify(value)}`);
    }
};
