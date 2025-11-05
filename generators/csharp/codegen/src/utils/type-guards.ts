import { fail } from "node:assert";

import { Type } from "../ast";
import { TypeLiteral } from "../ast/code/TypeLiteral";
import { type Provenance } from "../context/model-navigator";
import { is as DynamicIR } from "./dynamic-ir-type-guards";
import { is as IR } from "./ir-type-guards";
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

    Type: {
        string: (value: Type | undefined) => value instanceof Type.String,
        boolean: (value: Type | undefined) => value instanceof Type.Boolean,
        int: (value: Type | undefined) => value instanceof Type.Integer,
        long: (value: Type | undefined) => value instanceof Type.Long,
        uint: (value: Type | undefined) => value instanceof Type.Uint,
        ulong: (value: Type | undefined) => value instanceof Type.ULong,
        float: (value: Type | undefined) => value instanceof Type.Float,
        double: (value: Type | undefined) => value instanceof Type.Double,
        dateTime: (value: Type | undefined) => value instanceof Type.DateTime,
        uuid: (value: Type | undefined) => value instanceof Type.Uuid,
        object: (value: Type | undefined) => value instanceof Type.Object,
        array: (value: Type | undefined) => value instanceof Type.Array,
        listType: (value: Type | undefined) => value instanceof Type.ListType,
        list: (value: Type | undefined) => value instanceof Type.List,
        set: (value: Type | undefined) => value instanceof Type.Set,
        map: (value: Type | undefined) => value instanceof Type.Map,
        idictionary: (value: Type | undefined) => value instanceof Type.IDictionary,
        keyValuePair: (value: Type | undefined) => value instanceof Type.KeyValuePair,
        optional: (value: Type | undefined) => value instanceof Type.Optional,
        fileParam: (value: Type | undefined) => value instanceof Type.FileParameter,
        func: (value: Type | undefined) => value instanceof Type.Func,
        action: (value: Type | undefined) => value instanceof Type.Action,
        systemType: (value: Type | undefined) => value instanceof Type.SystemType,
        byte: (value: Type | undefined) => value instanceof Type.Binary,
        reference: (value: Type | undefined) => value instanceof Type.Reference,
        coreReference: (value: Type | undefined) => value instanceof Type.CoreReference,
        oneOf: (value: Type | undefined) => value instanceof Type.OneOf,
        oneOfBase: (value: Type | undefined) => value instanceof Type.OneOfBase,
        stringEnum: (value: Type | undefined) => value instanceof Type.StringEnum
    },

    TypeLiteral: {
        string: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.String,
        boolean: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Boolean,
        decimal: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Decimal,
        double: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Double,
        date: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Date,
        dateTime: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.DateTime,
        float: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Float,
        int: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Integer,
        long: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Long,
        uint: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Uint,
        ulong: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Ulong,
        class: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Class_,
        list: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.List,
        set: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Set,
        dictionary: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Dictionary,
        nop: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Nop,
        null: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Null,
        unknown: (value: TypeLiteral | undefined) => value instanceof TypeLiteral.Unknown
    },

    IR, // Intermediate Representation typeguards
    DynamicIR // Dynamic IR typeguards
};

export const assert = {
    object: (value: unknown): value is object => {
        return is.object(value) || fail(`Not an object type: ${JSON.stringify(value)}`);
    }
};
