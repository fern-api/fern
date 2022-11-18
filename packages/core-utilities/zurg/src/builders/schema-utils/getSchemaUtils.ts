import { BaseSchema, Schema } from "../../Schema";
import { OptionalSchema, OPTIONAL_BRAND } from "./types";

export interface SchemaUtils<Raw, Parsed> {
    optional: () => OptionalSchema<Raw, Parsed>;
    transform: <PostTransform>(transformer: BaseSchema<Parsed, PostTransform>) => Schema<Raw, PostTransform>;
}

export function getSchemaUtils<Raw, Parsed>(schema: BaseSchema<Raw, Parsed>): SchemaUtils<Raw, Parsed> {
    return {
        optional: () => optional(schema),
        transform: (transformer) => transform(schema, transformer),
    };
}

/**
 * schema utils are defined in one file to resolve issues with circular imports
 */

export function optional<Raw, Parsed>(schema: BaseSchema<Raw, Parsed>): OptionalSchema<Raw, Parsed> {
    const baseSchema: BaseSchema<Raw | null | undefined, Parsed | undefined> = {
        parse: (raw, opts) => (raw != null ? schema.parse(raw, opts) : undefined),
        json: (parsed, opts) => (parsed != null ? schema.json(parsed, opts) : undefined),
    };

    return {
        ...OPTIONAL_BRAND,
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}

export function transform<PreTransformRaw, PreTransformParsed, PostTransform>(
    schema: BaseSchema<PreTransformRaw, PreTransformParsed>,
    transformer: BaseSchema<PreTransformParsed, PostTransform>
): Schema<PreTransformRaw, PostTransform> {
    const baseSchema: BaseSchema<PreTransformRaw, PostTransform> = {
        parse: async (raw, opts) => {
            const postTransformParsed = await schema.parse(raw, opts);
            return transformer.parse(postTransformParsed, opts);
        },
        json: async (parsed, opts) => {
            const preTransformParsed = await transformer.json(parsed, opts);
            return schema.json(preTransformParsed, opts);
        },
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}
