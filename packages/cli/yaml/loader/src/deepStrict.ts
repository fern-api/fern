import { z } from "zod";

/**
 * Recursively applies `.strict()` to all `z.object()` schemas in a schema tree.
 *
 * By default, Zod silently strips unrecognized keys during parsing. This utility
 * walks the schema graph and applies `.strict()` to every object schema, causing
 * validation errors for unknown keys at any depth.
 */
export function deepStrict<S extends z.ZodSchema>(schema: S): S {
    return deepStrictImpl(schema, new WeakMap()) as S;
}

/**
 * Internal type for Zod schema definition internals.
 * This is not part of Zod's public API but is stable across Zod 4.x.
 */
interface ZodDef {
    type?: string;
    shape?: Record<string, z.ZodSchema>;
    element?: z.ZodSchema;
    innerType?: z.ZodSchema;
    options?: z.ZodSchema[];
    keyType?: z.ZodString;
    valueType?: z.ZodSchema;
    getter?: () => z.ZodSchema;
    items?: z.ZodSchema[];
    defaultValue?: unknown;
}

function getDef(schema: z.ZodSchema): ZodDef | undefined {
    return (schema as unknown as { _zod?: { def?: ZodDef } })._zod?.def;
}

function deepStrictImpl(schema: z.ZodSchema, cache: WeakMap<object, z.ZodSchema>): z.ZodSchema {
    if (cache.has(schema)) {
        return cache.get(schema) as z.ZodSchema;
    }

    const def = getDef(schema);
    if (def == null) {
        return schema;
    }

    switch (def.type) {
        case "object": {
            const shape = def.shape ?? {};
            const newShape: Record<string, z.ZodSchema> = {};
            for (const [key, value] of Object.entries(shape)) {
                newShape[key] = deepStrictImpl(value, cache);
            }
            const result = z.object(newShape).strict();
            cache.set(schema, result);
            return result;
        }
        case "array": {
            const element = def.element;
            return element != null ? z.array(deepStrictImpl(element, cache)) : schema;
        }
        case "optional": {
            const inner = def.innerType;
            return inner != null ? deepStrictImpl(inner, cache).optional() : schema;
        }
        case "nullable": {
            const inner = def.innerType;
            return inner != null ? deepStrictImpl(inner, cache).nullable() : schema;
        }
        case "union": {
            const options = def.options;
            return options != null ? z.union(options.map((option) => deepStrictImpl(option, cache))) : schema;
        }
        case "record": {
            const keyType = def.keyType;
            const valueType = def.valueType;
            return keyType != null && valueType != null ? z.record(keyType, deepStrictImpl(valueType, cache)) : schema;
        }
        case "lazy": {
            const getter = def.getter;
            if (getter == null) {
                return schema;
            }
            const result = z.lazy(() => deepStrictImpl(getter(), cache));
            cache.set(schema, result);
            return result;
        }
        case "tuple": {
            const items = def.items;
            if (items == null) {
                return schema;
            }
            return (z.tuple as (...args: unknown[]) => z.ZodSchema)(items.map((item) => deepStrictImpl(item, cache)));
        }
        case "default": {
            const inner = def.innerType;
            return inner != null ? deepStrictImpl(inner, cache).default(def.defaultValue) : schema;
        }
        default:
            return schema;
    }
}
