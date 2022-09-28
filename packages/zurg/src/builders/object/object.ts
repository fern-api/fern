import { Schema } from "../../Schema";
import { entries } from "../../utils/entries";
import { getObjectLikeUtils, OBJECT_LIKE_BRAND } from "../object-like";
import { getSchemaUtils } from "../schema-utils";
import { isProperty } from "./property";
import {
    BaseObjectSchema,
    inferObjectSchemaFromPropertySchemas,
    inferParsedObjectFromPropertySchemas,
    inferRawObjectFromPropertySchemas,
    ObjectUtils,
    PropertySchemas,
} from "./types";

interface ObjectPropertyWithRawKey {
    rawKey: string;
    parsedKey: string | number | symbol;
    valueSchema: Schema<any, any>;
}

export function object<ParsedKeys extends string, T extends PropertySchemas<ParsedKeys>>(
    schemas: T
): inferObjectSchemaFromPropertySchemas<T> {
    const baseSchema: BaseObjectSchema<
        inferRawObjectFromPropertySchemas<T>,
        inferParsedObjectFromPropertySchemas<T>
    > = {
        ...OBJECT_LIKE_BRAND,

        parse: (raw, { skipUnknownKeysOnParse = false } = {}) => {
            const rawKeyToProperty: Record<string, ObjectPropertyWithRawKey> = {};

            for (const [parsedKey, schemaOrObjectProperty] of entries(schemas)) {
                const rawKey = isProperty(schemaOrObjectProperty) ? schemaOrObjectProperty.rawKey : parsedKey;

                const property: ObjectPropertyWithRawKey = {
                    rawKey,
                    parsedKey,
                    valueSchema: isProperty(schemaOrObjectProperty)
                        ? schemaOrObjectProperty.valueSchema
                        : schemaOrObjectProperty,
                };

                rawKeyToProperty[rawKey] = property;
            }

            const parsed: Record<string | number | symbol, any> = {};

            for (const [rawKey, rawPropertyValue] of Object.entries(raw)) {
                const property = rawKeyToProperty[rawKey];

                if (property != null) {
                    const value = property.valueSchema.parse(rawPropertyValue);
                    if (value != null) {
                        parsed[property.parsedKey] = value;
                    }
                } else if (!skipUnknownKeysOnParse && rawPropertyValue != null) {
                    parsed[rawKey] = rawPropertyValue;
                }
            }

            return parsed as inferParsedObjectFromPropertySchemas<T>;
        },

        json: (parsed, { includeUnknownKeysOnJson = false } = {}) => {
            const raw: Record<string | number | symbol, any> = {};

            for (const [parsedKey, parsedPropertyValue] of entries(parsed)) {
                const schemaOrObjectProperty = schemas[parsedKey as keyof T];
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (schemaOrObjectProperty != null) {
                    if (isProperty(schemaOrObjectProperty)) {
                        const value = schemaOrObjectProperty.valueSchema.json(parsedPropertyValue);
                        if (value != null) {
                            raw[schemaOrObjectProperty.rawKey] = value;
                        }
                    } else {
                        const value = schemaOrObjectProperty.json(parsedPropertyValue);
                        if (value != null) {
                            raw[parsedKey] = value;
                        }
                    }
                } else if (includeUnknownKeysOnJson && parsedPropertyValue != null) {
                    raw[parsedKey] = parsedPropertyValue;
                }
            }

            return raw as inferRawObjectFromPropertySchemas<T>;
        },
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
        ...getObjectLikeUtils(baseSchema),
        ...getObjectUtils(baseSchema),
    };
}

export function getObjectUtils<Raw, Parsed>(schema: BaseObjectSchema<Raw, Parsed>): ObjectUtils<Raw, Parsed> {
    return {
        extend: <U extends PropertySchemas<keyof U>>(extension: U) => {
            const baseSchema: BaseObjectSchema<
                Raw & inferRawObjectFromPropertySchemas<U>,
                Parsed & inferParsedObjectFromPropertySchemas<U>
            > = {
                ...OBJECT_LIKE_BRAND,
                parse: (raw, opts) => ({
                    ...schema.parse(raw, opts),
                    ...object(extension).parse(raw, opts),
                }),
                json: (parsed, opts) => ({
                    ...schema.json(parsed, opts),
                    ...object(extension).json(parsed, opts),
                }),
            };

            return {
                ...baseSchema,
                ...getSchemaUtils(baseSchema),
                ...getObjectLikeUtils(baseSchema),
                ...getObjectUtils(baseSchema),
            };
        },
    };
}
