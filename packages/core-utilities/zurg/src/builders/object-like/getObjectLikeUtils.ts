import { getSchemaUtils } from "../schema-utils";
import { BaseObjectLikeSchema, ObjectLikeSchema, ObjectLikeUtils, OBJECT_LIKE_BRAND } from "./types";

export function getObjectLikeUtils<Raw, Parsed>(
    schema: BaseObjectLikeSchema<Raw, Parsed>
): ObjectLikeUtils<Raw, Parsed> {
    return {
        withProperties: (properties) => withProperties(schema, properties),
    };
}

/**
 * object-like utils are defined in one file to resolve issues with circular imports
 */

export function withProperties<RawObjectShape, ParsedObjectShape, Properties>(
    objectLike: BaseObjectLikeSchema<RawObjectShape, ParsedObjectShape>,
    properties: { [K in keyof Properties]: Properties[K] | ((parsed: ParsedObjectShape) => Properties[K]) }
): ObjectLikeSchema<RawObjectShape, ParsedObjectShape & Properties> {
    const objectSchema: BaseObjectLikeSchema<RawObjectShape, ParsedObjectShape & Properties> = {
        ...OBJECT_LIKE_BRAND,
        parse: async (raw, opts) => {
            const parsedObject = await objectLike.parse(raw, opts);
            const additionalProperties = Object.entries(properties).reduce<Record<string, any>>(
                (processed, [key, value]) => {
                    return {
                        ...processed,
                        [key]: typeof value === "function" ? value(parsedObject) : value,
                    };
                },
                {}
            );

            return {
                ...parsedObject,
                ...(additionalProperties as Properties),
            };
        },
        json: (parsed, opts) => {
            // strip out added properties
            const addedPropertyKeys = new Set(Object.keys(properties));
            const parsedWithoutAddedProperties = Object.entries(parsed).reduce<Record<string, any>>(
                (filtered, [key, value]) => {
                    if (!addedPropertyKeys.has(key)) {
                        filtered[key] = value;
                    }
                    return filtered;
                },
                {}
            );

            return objectLike.json(parsedWithoutAddedProperties as ParsedObjectShape, opts);
        },
    };

    return {
        ...objectSchema,
        ...getSchemaUtils(objectSchema),
        ...getObjectLikeUtils(objectSchema),
    };
}
