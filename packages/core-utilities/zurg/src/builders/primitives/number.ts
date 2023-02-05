import { SchemaType } from "../../Schema";
import { createIdentitySchemaCreator } from "../../utils/createIdentitySchemaCreator";

export const number = createIdentitySchemaCreator<number>(SchemaType.NUMBER, (value) => {
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
                    path: [],
                    message: "Not a number",
                },
            ],
        };
    }
});
