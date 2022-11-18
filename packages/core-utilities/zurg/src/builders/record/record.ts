import { BaseSchema, Schema } from "../../Schema";
import { entries } from "../../utils/entries";
import { getSchemaUtils } from "../schema-utils";

export function record<RawKey extends string | number, ParsedKey extends string | number, RawValue, ParsedValue>(
    keySchema: Schema<RawKey, ParsedKey>,
    valueSchema: Schema<RawValue, ParsedValue>
): Schema<Record<RawKey, RawValue>, Record<ParsedKey, ParsedValue>> {
    const baseSchema: BaseSchema<Record<RawKey, RawValue>, Record<ParsedKey, ParsedValue>> = {
        parse: (raw, opts) => {
            return entries(raw).reduce(async (parsedPromise, [key, value]) => {
                const parsed: Record<ParsedKey, ParsedValue> = await parsedPromise;
                const parsedKey = await keySchema.parse(key, opts);
                parsed[parsedKey] = await valueSchema.parse(value, opts);
                return parsedPromise;
            }, Promise.resolve({} as Record<ParsedKey, ParsedValue>));
        },
        json: (parsed, opts) => {
            return entries(parsed).reduce(async (rawPromise, [key, value]) => {
                const raw: Record<RawKey, RawValue> = await rawPromise;
                const rawKey = await keySchema.json(key, opts);
                raw[rawKey] = await valueSchema.json(value, opts);
                return rawPromise;
            }, Promise.resolve({} as Record<RawKey, RawValue>));
        },
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}
