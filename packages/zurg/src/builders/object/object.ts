import { Schema } from "../../Schema";
import { getSchemaUtils } from "../../SchemaUtils";
import { entries } from "../../utils/entries";
import { BaseObjectLikeSchema, getObjectLikeProperties, OBJECT_LIKE_BRAND } from "./ObjectLikeSchema";
import { isProperty } from "./property";
import { inferParsedObject, inferRawObject, ObjectSchema, PropertySchemas } from "./types";

interface ObjectPropertyWithRawKey {
    rawKey: string;
    parsedKey: string | number | symbol;
    valueSchema: Schema<any, any>;
}

export function object<T extends PropertySchemas<T>>(
    schemas: T
): ObjectSchema<inferRawObject<T>, inferParsedObject<T>> {
    const baseSchema: BaseObjectLikeSchema<inferRawObject<T>, inferParsedObject<T>> = {
        ...OBJECT_LIKE_BRAND,

        parse: (raw, { skipUnknownKeys = false } = {}) => {
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
                    parsed[property.parsedKey] = property.valueSchema.parse(rawPropertyValue);
                } else if (!skipUnknownKeys) {
                    parsed[rawKey] = rawPropertyValue;
                }
            }

            return parsed as inferParsedObject<T>;
        },

        json: (parsed, { skipUnknownKeys = false } = {}) => {
            const raw: Record<string | number | symbol, any> = {};

            for (const [parsedKey, parsedPropertyValue] of entries(parsed)) {
                const schemaOrObjectProperty = schemas[parsedKey as keyof T];
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (schemaOrObjectProperty != null) {
                    if (isProperty(schemaOrObjectProperty)) {
                        raw[schemaOrObjectProperty.rawKey] =
                            schemaOrObjectProperty.valueSchema.json(parsedPropertyValue);
                    } else {
                        raw[parsedKey] = schemaOrObjectProperty.json(parsedPropertyValue);
                    }
                } else if (!skipUnknownKeys) {
                    raw[parsedKey] = parsedPropertyValue;
                }
            }

            return raw as inferRawObject<T>;
        },
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
        ...getObjectLikeProperties(baseSchema),
    };
}
