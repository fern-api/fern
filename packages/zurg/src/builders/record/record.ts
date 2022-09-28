import { BaseSchema, Schema } from "../../Schema";
import { entries } from "../../utils/entries";
import { getSchemaUtils } from "../schema-utils";

export function record<RawKey extends string | number, ParsedKey extends string | number, RawValue, ParsedValue>(
    keySchema: Schema<RawKey, ParsedKey>,
    valueSchema: Schema<RawValue, ParsedValue>
): Schema<Record<RawKey, RawValue>, Record<ParsedKey, ParsedValue>> {
    const baseSchema: BaseSchema<Record<RawKey, RawValue>, Record<ParsedKey, ParsedValue>> = {
        parse: (raw, opts) => {
            return entries(raw).reduce(
                (parsed, [key, value]) => {
                    parsed[keySchema.parse(key, opts)] = valueSchema.parse(value, opts);
                    return parsed;
                },
                // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
                {} as Record<ParsedKey, ParsedValue>
            );
        },
        json: (parsed, opts) => {
            return entries(parsed).reduce(
                (raw, [key, value]) => {
                    raw[keySchema.json(key, opts)] = valueSchema.json(value, opts);
                    return raw;
                },
                // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
                {} as Record<RawKey, RawValue>
            );
        },
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}
