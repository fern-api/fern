import { BaseSchema, Schema } from "../../Schema";
import { getSchemaUtils } from "../../SchemaUtils";

export function stringLiteral<Parsed extends string>(parsed: Parsed): StringLiteralSchema<Parsed, Parsed>;
export function stringLiteral<Raw extends string, Parsed extends string>(
    parsed: Parsed,
    raw: Raw
): StringLiteralSchema<Raw, Parsed>;
export function stringLiteral<Raw extends string, Parsed extends string>(
    parsed: Parsed,
    raw: Raw = parsed as unknown as Raw
): StringLiteralSchema<Raw, Parsed> {
    const baseSchema: BaseSchema<Raw, Parsed> = {
        parse: () => parsed,
        json: () => raw,
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
        raw,
        parsed,
    };
}

export type StringLiteralSchema<Raw extends string, Parsed extends string> = Schema<Raw, Parsed> & {
    parsed: string;
    raw: string;
};
