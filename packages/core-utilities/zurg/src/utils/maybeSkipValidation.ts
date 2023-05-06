import { BaseSchema, MaybeValid, SchemaOptions } from "../Schema";
import { MaybePromise } from "./MaybePromise";

export function maybeSkipValidation<S extends BaseSchema<Raw, Parsed>, Raw, Parsed>(schema: S): S {
    return {
        ...schema,
        json: transformAndMaybeSkipValidation(schema.json),
        parse: transformAndMaybeSkipValidation(schema.parse),
    };
}

function transformAndMaybeSkipValidation<T>(
    transform: (value: unknown, opts?: SchemaOptions) => MaybePromise<MaybeValid<T>>
): (value: unknown, opts?: SchemaOptions) => MaybePromise<MaybeValid<T>> {
    return async (value, opts): Promise<MaybeValid<T>> => {
        const transformed = await transform(value, opts);
        const { skipValidation = false } = opts ?? {};
        if (!transformed.ok && skipValidation) {
            return {
                ok: true,
                value: value as T,
            };
        } else {
            return transformed;
        }
    };
}
