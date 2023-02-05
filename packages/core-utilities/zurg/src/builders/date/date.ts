import { BaseSchema, Schema, SchemaType } from "../../Schema";
import { getSchemaUtils } from "../schema-utils";

// https://stackoverflow.com/questions/12756159/regex-and-iso8601-formatted-datetime
const ISO_8601_REGEX =
    /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;

export function date(): Schema<string, Date> {
    const baseSchema: BaseSchema<string, Date> = {
        parse: (raw) => {
            if (typeof raw === "string" && ISO_8601_REGEX.test(raw)) {
                return {
                    ok: true,
                    value: new Date(raw),
                };
            } else {
                return {
                    ok: false,
                    errors: [
                        {
                            path: [],
                            message: "Not an ISO 8601 date string",
                        },
                    ],
                };
            }
        },
        json: (date) => {
            if (date instanceof Date) {
                return {
                    ok: true,
                    value: date.toISOString(),
                };
            } else {
                return {
                    ok: false,
                    errors: [
                        {
                            path: [],
                            message: "Not a Date object",
                        },
                    ],
                };
            }
        },
        getType: () => SchemaType.DATE,
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}
