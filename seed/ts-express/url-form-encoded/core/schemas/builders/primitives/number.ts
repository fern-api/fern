import { type Schema, SchemaType } from "../../Schema";
import { createIdentitySchemaCreator } from "../../utils/createIdentitySchemaCreator";
import { getErrorMessageForIncorrectType } from "../../utils/getErrorMessageForIncorrectType";

export const number: () => Schema<number, number> = createIdentitySchemaCreator<number>(
    SchemaType.NUMBER,
    (value, { breadcrumbsPrefix = [] } = {}) => {
        if (typeof value === "number") {
            return {
                ok: true,
                value,
            };
        } else {
            return {
                ok: false,
                errors: [
                    {
                        path: breadcrumbsPrefix,
                        message: getErrorMessageForIncorrectType(value, "number"),
                    },
                ],
            };
        }
    },
);
