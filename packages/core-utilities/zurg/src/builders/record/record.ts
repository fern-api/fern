import { MaybeValid, Schema, SchemaType, ValidationError } from "../../Schema";
import { entries } from "../../utils/entries";
import { isPlainObject, NOT_AN_OBJECT_ERROR_MESSAGE } from "../../utils/isPlainObject";
import { MaybePromise } from "../../utils/MaybePromise";
import { getSchemaUtils } from "../schema-utils";
import { BaseRecordSchema, RecordSchema } from "./types";

export function record<RawKey extends string | number, RawValue, ParsedValue, ParsedKey extends string | number>(
    keySchema: Schema<RawKey, ParsedKey>,
    valueSchema: Schema<RawValue, ParsedValue>
): RecordSchema<RawKey, RawValue, ParsedKey, ParsedValue> {
    const baseSchema: BaseRecordSchema<RawKey, RawValue, ParsedKey, ParsedValue> = {
        parse: async (raw, opts) => {
            return validateAndTransformRecord({
                value: raw,
                isKeyNumeric: (await keySchema.getType()) === SchemaType.NUMBER,
                transformKey: (key) => keySchema.parse(key, opts),
                transformValue: (value) => valueSchema.parse(value, opts),
            });
        },
        json: async (parsed, opts) => {
            return validateAndTransformRecord({
                value: parsed,
                isKeyNumeric: (await keySchema.getType()) === SchemaType.NUMBER,
                transformKey: (key) => keySchema.json(key, opts),
                transformValue: (value) => valueSchema.json(value, opts),
            });
        },
        getType: () => SchemaType.RECORD,
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}

async function validateAndTransformRecord<TransformedKey extends string | number, TransformedValue>({
    value,
    isKeyNumeric,
    transformKey,
    transformValue,
}: {
    value: unknown;
    isKeyNumeric: boolean;
    transformKey: (key: string | number) => MaybePromise<MaybeValid<TransformedKey>>;
    transformValue: (value: unknown) => MaybePromise<MaybeValid<TransformedValue>>;
}): Promise<MaybeValid<Record<TransformedKey, TransformedValue>>> {
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

    return entries(value).reduce<Promise<MaybeValid<Record<TransformedKey, TransformedValue>>>>(
        async (accPromise, [stringKey, value]) => {
            // skip nullish keys
            if (value == null) {
                return accPromise;
            }

            const acc = await accPromise;

            let key: string | number = stringKey;
            if (isKeyNumeric) {
                const numberKey = stringKey.length > 0 ? Number(stringKey) : NaN;
                if (!isNaN(numberKey)) {
                    key = numberKey;
                }
            }
            const transformedKey = await transformKey(key);

            const transformedValue = await transformValue(value);

            if (acc.ok && transformedKey.ok && transformedValue.ok) {
                return {
                    ok: true,
                    value: {
                        ...acc.value,
                        [transformedKey.value]: transformedValue.value,
                    },
                };
            }

            const errors: ValidationError[] = [];
            if (!acc.ok) {
                errors.push(...acc.errors);
            }
            if (!transformedKey.ok) {
                errors.push(
                    ...transformedKey.errors.map((error) => ({
                        path: [`${key} (key)`, ...error.path],
                        message: error.message,
                    }))
                );
            }
            if (!transformedValue.ok) {
                errors.push(
                    ...transformedValue.errors.map((error) => ({
                        path: [stringKey, ...error.path],
                        message: error.message,
                    }))
                );
            }

            return {
                ok: false,
                errors,
            };
        },
        Promise.resolve({ ok: true, value: {} as Record<TransformedKey, TransformedValue> })
    );
}
