import { BaseSchema, Schema, SchemaType } from "../../Schema.js";
import { getErrorMessageForIncorrectType } from "../../utils/getErrorMessageForIncorrectType.js";
import { maybeSkipValidation } from "../../utils/maybeSkipValidation.js";
import { getSchemaUtils } from "../schema-utils/index.js";

export function bigint(): Schema<string, bigint> {
    const baseSchema: BaseSchema<string, bigint> = {
        parse: (raw, { breadcrumbsPrefix = [] } = {}) => {
            if (typeof raw !== "string") {
                return {
                    ok: false,
                    errors: [
                        {
                            path: breadcrumbsPrefix,
                            message: getErrorMessageForIncorrectType(raw, "string"),
                        },
                    ],
                };
            }
            return {
                ok: true,
                value: BigInt(raw),
            };
        },
        json: (bigint, { breadcrumbsPrefix = [] } = {}) => {
            if (typeof bigint === "bigint") {
                return {
                    ok: true,
                    value: bigint.toString(),
                };
            } else {
                return {
                    ok: false,
                    errors: [
                        {
                            path: breadcrumbsPrefix,
                            message: getErrorMessageForIncorrectType(bigint, "bigint"),
                        },
                    ],
                };
            }
        },
        getType: () => SchemaType.BIGINT,
    };

    return {
        ...maybeSkipValidation(baseSchema),
        ...getSchemaUtils(baseSchema),
    };
}
