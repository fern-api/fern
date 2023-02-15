import { MaybeValid, Schema, SchemaType, ValidationError } from "../../Schema";
import { entries } from "../../utils/entries";
import { filterObject } from "../../utils/filterObject";
import { isPlainObject, NOT_AN_OBJECT_ERROR_MESSAGE } from "../../utils/isPlainObject";
import { keys } from "../../utils/keys";
import { MaybePromise } from "../../utils/MaybePromise";
import { partition } from "../../utils/partition";
import { getObjectLikeUtils } from "../object-like";
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
    parsedKey: string;
    valueSchema: Schema<any, any>;
}

export function object<ParsedKeys extends string, T extends PropertySchemas<ParsedKeys>>(
    schemas: T
): inferObjectSchemaFromPropertySchemas<T> {
    const baseSchema: BaseObjectSchema<
        inferRawObjectFromPropertySchemas<T>,
        inferParsedObjectFromPropertySchemas<T>
    > = {
        _getRawProperties: () =>
            Promise.resolve(
                Object.entries(schemas).map(([parsedKey, propertySchema]) =>
                    isProperty(propertySchema) ? propertySchema.rawKey : parsedKey
                ) as unknown as (keyof inferRawObjectFromPropertySchemas<T>)[]
            ),
        _getParsedProperties: () =>
            Promise.resolve(keys(schemas) as unknown as (keyof inferParsedObjectFromPropertySchemas<T>)[]),

        parse: async (raw, opts) => {
            const rawKeyToProperty: Record<string, ObjectPropertyWithRawKey> = {};
            const requiredKeys: string[] = [];

            for (const [parsedKey, schemaOrObjectProperty] of entries(schemas)) {
                const rawKey = isProperty(schemaOrObjectProperty) ? schemaOrObjectProperty.rawKey : parsedKey;
                const valueSchema: Schema<any, any> = isProperty(schemaOrObjectProperty)
                    ? schemaOrObjectProperty.valueSchema
                    : schemaOrObjectProperty;

                const property: ObjectPropertyWithRawKey = {
                    rawKey,
                    parsedKey: parsedKey as string,
                    valueSchema,
                };

                rawKeyToProperty[rawKey] = property;

                if (await isSchemaRequired(valueSchema)) {
                    requiredKeys.push(rawKey);
                }
            }

            return validateAndTransformObject({
                value: raw,
                requiredKeys,
                getProperty: (rawKey) => {
                    const property = rawKeyToProperty[rawKey];
                    if (property == null) {
                        return undefined;
                    }
                    return {
                        transformedKey: property.parsedKey,
                        transform: (propertyValue) => property.valueSchema.parse(propertyValue, opts),
                    };
                },
                allowUnknownKeys: opts?.allowUnknownKeys ?? false,
            });
        },

        json: async (parsed, opts) => {
            const requiredKeys: string[] = [];

            for (const [parsedKey, schemaOrObjectProperty] of entries(schemas)) {
                const valueSchema: Schema<any, any> = isProperty(schemaOrObjectProperty)
                    ? schemaOrObjectProperty.valueSchema
                    : schemaOrObjectProperty;

                if (await isSchemaRequired(valueSchema)) {
                    requiredKeys.push(parsedKey as string);
                }
            }

            return validateAndTransformObject({
                value: parsed,
                requiredKeys,
                getProperty: (
                    parsedKey
                ):
                    | { transformedKey: string; transform: (propertyValue: unknown) => MaybePromise<MaybeValid<any>> }
                    | undefined => {
                    const property = schemas[parsedKey as keyof T];

                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (property == null) {
                        return undefined;
                    }

                    if (isProperty(property)) {
                        return {
                            transformedKey: property.rawKey,
                            transform: (propertyValue) => property.valueSchema.json(propertyValue, opts),
                        };
                    } else {
                        return {
                            transformedKey: parsedKey,
                            transform: (propertyValue) => property.json(propertyValue, opts),
                        };
                    }
                },
                allowUnknownKeys: opts?.allowUnknownKeys ?? false,
            });
        },

        getType: () => SchemaType.OBJECT,
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
        ...getObjectLikeUtils(baseSchema),
        ...getObjectUtils(baseSchema),
    };
}

async function validateAndTransformObject<Transformed>({
    value,
    requiredKeys,
    getProperty,
    allowUnknownKeys,
}: {
    value: unknown;
    requiredKeys: string[];
    getProperty: (
        preTransformedKey: string
    ) => { transformedKey: string; transform: (propertyValue: unknown) => MaybePromise<MaybeValid<any>> } | undefined;
    allowUnknownKeys: boolean;
}): Promise<MaybeValid<Transformed>> {
    if (!isPlainObject(value)) {
        return {
            ok: false,
            errors: [
                {
                    path: [],
                    message: NOT_AN_OBJECT_ERROR_MESSAGE,
                },
            ],
        };
    }

    const missingRequiredKeys = new Set(requiredKeys);
    const errors: ValidationError[] = [];
    const transformed: Record<string | number | symbol, any> = {};

    for (const [preTransformedKey, preTransformedItemValue] of Object.entries(value)) {
        const property = getProperty(preTransformedKey);

        if (property != null) {
            missingRequiredKeys.delete(preTransformedKey);

            const value = await property.transform(preTransformedItemValue);
            if (value.ok) {
                transformed[property.transformedKey] = value.value;
            } else {
                errors.push(
                    ...value.errors.map((error) => ({
                        path: [preTransformedKey, ...error.path],
                        message: error.message,
                    }))
                );
            }
        } else if (allowUnknownKeys) {
            transformed[preTransformedKey] = preTransformedItemValue;
        } else {
            errors.push({
                path: [preTransformedKey],
                message: `Unrecognized key "${preTransformedKey}"`,
            });
        }
    }

    errors.push(
        ...requiredKeys
            .filter((key) => missingRequiredKeys.has(key))
            .map((key) => ({
                path: [],
                message: `Missing required key "${key}"`,
            }))
    );

    if (errors.length === 0) {
        return {
            ok: true,
            value: transformed as Transformed,
        };
    } else {
        return {
            ok: false,
            errors,
        };
    }
}

export function getObjectUtils<Raw, Parsed>(schema: BaseObjectSchema<Raw, Parsed>): ObjectUtils<Raw, Parsed> {
    return {
        extend: <RawExtension, ParsedExtension>(extension: ObjectSchema<RawExtension, ParsedExtension>) => {
            const baseSchema: BaseObjectSchema<Raw & RawExtension, Parsed & ParsedExtension> = {
                _getParsedProperties: async () => [
                    ...(await schema._getParsedProperties()),
                    ...(await extension._getParsedProperties()),
                ],
                _getRawProperties: async () => [
                    ...(await schema._getRawProperties()),
                    ...(await extension._getRawProperties()),
                ],
                parse: async (raw, opts) => {
                    return validateAndTransformExtendedObject({
                        extensionKeys: await extension._getRawProperties(),
                        value: raw,
                        transformBase: (rawBase) => schema.parse(rawBase, opts),
                        transformExtension: (rawExtension) => extension.parse(rawExtension, opts),
                    });
                },
                json: async (parsed, opts) => {
                    return validateAndTransformExtendedObject({
                        extensionKeys: await extension._getParsedProperties(),
                        value: parsed,
                        transformBase: (parsedBase) => schema.json(parsedBase, opts),
                        transformExtension: (parsedExtension) => extension.json(parsedExtension, opts),
                    });
                },
                getType: () => SchemaType.OBJECT,
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

async function validateAndTransformExtendedObject<PreTransformedExtension, TransformedBase, TransformedExtension>({
    extensionKeys,
    value,
    transformBase,
    transformExtension,
}: {
    extensionKeys: (keyof PreTransformedExtension)[];
    value: unknown;
    transformBase: (value: unknown) => MaybePromise<MaybeValid<TransformedBase>>;
    transformExtension: (value: unknown) => MaybePromise<MaybeValid<TransformedExtension>>;
}): Promise<MaybeValid<TransformedBase & TransformedExtension>> {
    const extensionPropertiesSet = new Set(extensionKeys);
    const [extensionProperties, baseProperties] = partition(keys(value), (key) =>
        extensionPropertiesSet.has(key as keyof PreTransformedExtension)
    );

    const transformedBase = await transformBase(filterObject(value, baseProperties));
    const transformedExtension = await transformExtension(filterObject(value, extensionProperties));

    if (transformedBase.ok && transformedExtension.ok) {
        return {
            ok: true,
            value: {
                ...transformedBase.value,
                ...transformedExtension.value,
            },
        };
    } else {
        return {
            ok: false,
            errors: [
                ...(transformedBase.ok ? [] : transformedBase.errors),
                ...(transformedExtension.ok ? [] : transformedExtension.errors),
            ],
        };
    }
}

async function isSchemaRequired(schema: Schema<any, any>): Promise<boolean> {
    return !(await isSchemaOptional(schema));
}

async function isSchemaOptional(schema: Schema<any, any>): Promise<boolean> {
    switch (await schema.getType()) {
        case SchemaType.ANY:
        case SchemaType.UNKNOWN:
        case SchemaType.OPTIONAL:
            return true;
        default:
            return false;
    }
}
