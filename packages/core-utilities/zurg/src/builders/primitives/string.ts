import { SchemaType } from "../../Schema";
import { createIdentitySchemaCreator } from "../../utils/createIdentitySchemaCreator";

export const string = createIdentitySchemaCreator<string>(SchemaType.STRING, (value) => {
    if (typeof value === "string") {
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
                    message: "Not a string",
                },
            ],
        };
    }
});
