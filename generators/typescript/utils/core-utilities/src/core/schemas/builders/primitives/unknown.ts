import { type Schema, SchemaType } from "../../Schema";
import { createIdentitySchemaCreator } from "../../utils/createIdentitySchemaCreator";

export const unknown: () => Schema<unknown, unknown> = createIdentitySchemaCreator<unknown>(
    SchemaType.UNKNOWN,
    (value) => ({ ok: true, value }),
);
