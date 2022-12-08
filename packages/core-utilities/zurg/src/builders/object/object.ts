import { Schema } from "../../Schema";
import { entries } from "../../utils/entries";
import { filterObject } from "../../utils/filterObject";
import { keys } from "../../utils/keys";
import { partition } from "../../utils/partition";
import { getObjectLikeUtils, OBJECT_LIKE_BRAND } from "../object-like";
import { getSchemaUtils } from "../schema-utils";
import { isProperty } from "./property";
import {
    BaseObjectSchema,
    inferObjectSchemaFromPropertySchemas,
    inferParsedObjectFromPropertySchemas,
    inferRawObjectFromPropertySchemas,
    ObjectSchema,
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
        _getRawProperties: () =>
            Promise.resolve(
                Object.entries(schemas).map(([parsedKey, propertySchema]) =>
                    isProperty(propertySchema) ? propertySchema.rawKey : parsedKey
                ) as unknown as (keyof inferRawObjectFromPropertySchemas<T>)[]
            ),
        _getParsedProperties: () =>
            Promise.resolve(keys(schemas) as unknown as (keyof inferParsedObjectFromPropertySchemas<T>)[]),

        parse: async (raw, { skipUnknownKeysOnParse = false } = {}) => {
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
                    const value = await property.valueSchema.parse(rawPropertyValue);
                    parsed[property.parsedKey] = value;
                } else if (!skipUnknownKeysOnParse && rawPropertyValue != null) {
                    parsed[rawKey] = rawPropertyValue;
                }
            }

            return parsed as inferParsedObjectFromPropertySchemas<T>;
        },

        json: async (parsed, { includeUnknownKeysOnJson = false } = {}) => {
            const raw: Record<string | number | symbol, any> = {};

            for (const [parsedKey, parsedPropertyValue] of entries(parsed)) {
                const schemaOrObjectProperty = schemas[parsedKey as keyof T];
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (schemaOrObjectProperty != null) {
                    if (isProperty(schemaOrObjectProperty)) {
                        const value = await schemaOrObjectProperty.valueSchema.json(parsedPropertyValue);
                        raw[schemaOrObjectProperty.rawKey] = value;
                    } else {
                        const value = await schemaOrObjectProperty.json(parsedPropertyValue);
                        raw[parsedKey] = value;
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
        extend: <RawExtension, ParsedExtension>(extension: ObjectSchema<RawExtension, ParsedExtension>) => {
            const baseSchema: BaseObjectSchema<Raw & RawExtension, Parsed & ParsedExtension> = {
                ...OBJECT_LIKE_BRAND,
                _getParsedProperties: async () => [
                    ...(await schema._getParsedProperties()),
                    ...(await extension._getParsedProperties()),
                ],
                _getRawProperties: async () => [
                    ...(await schema._getRawProperties()),
                    ...(await extension._getRawProperties()),
                ],
                parse: async (raw, opts) => {
                    const rawExtensionPropertiesSet = new Set(await extension._getRawProperties());
                    const [extensionProperties, otherProperties] = partition(keys(raw), (key) =>
                        rawExtensionPropertiesSet.has(key as keyof RawExtension)
                    );
                    return {
                        ...(await schema.parse(filterObject(raw, otherProperties), opts)),
                        ...(await extension.parse(filterObject(raw, extensionProperties), opts)),
                    };
                },
                json: async (parsed, opts) => {
                    const parsedExtensionPropertiesSet = new Set(await extension._getParsedProperties());
                    const [extensionProperties, otherProperties] = partition(keys(parsed), (key) =>
                        parsedExtensionPropertiesSet.has(key as keyof ParsedExtension)
                    );
                    return {
                        ...(await schema.json(filterObject(parsed, otherProperties), opts)),
                        ...(await extension.json(filterObject(parsed, extensionProperties), opts)),
                    };
                },
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
