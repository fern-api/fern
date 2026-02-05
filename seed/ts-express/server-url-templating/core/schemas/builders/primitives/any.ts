import { type Schema, SchemaType } from "../../Schema";
import { createIdentitySchemaCreator } from "../../utils/createIdentitySchemaCreator";

export const any: () => Schema<any, any> = createIdentitySchemaCreator<any>(SchemaType.ANY, (value) => ({
    ok: true,
    value,
}));
