import { SchemaType } from "../../Schema.js";
import { createIdentitySchemaCreator } from "../../utils/createIdentitySchemaCreator.js";
import { getErrorMessageForIncorrectType } from "../../utils/getErrorMessageForIncorrectType.js";

export const boolean = createIdentitySchemaCreator<boolean>(
    SchemaType.BOOLEAN,
    (value, { breadcrumbsPrefix = [] } = {}) => {
        if (typeof value === "boolean") {
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
                        message: getErrorMessageForIncorrectType(value, "boolean"),
                    },
                ],
            };
        }
    },
);
