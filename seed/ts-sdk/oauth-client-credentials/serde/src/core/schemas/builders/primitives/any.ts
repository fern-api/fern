import { SchemaType } from "../../Schema.js";
import { createIdentitySchemaCreator } from "../../utils/createIdentitySchemaCreator.js";

export const any = createIdentitySchemaCreator<any>(SchemaType.ANY, (value) => ({ ok: true, value }));
