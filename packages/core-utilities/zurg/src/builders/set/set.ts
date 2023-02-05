import { BaseSchema, Schema, SchemaType } from "../../Schema";
import { list } from "../list";
import { getSchemaUtils } from "../schema-utils";

export function set<Raw, Parsed>(schema: Schema<Raw, Parsed>): Schema<Raw[], Set<Parsed>> {
    const listSchema = list(schema);
    const baseSchema: BaseSchema<Raw[], Set<Parsed>> = {
        parse: async (raw, opts) => {
            const parsedList = await listSchema.parse(raw, opts);
            if (parsedList.ok) {
                return {
                    ok: true,
                    value: new Set(parsedList.value),
                };
            } else {
                return parsedList;
            }
        },
        json: async (parsed, opts) => {
            if (!(parsed instanceof Set)) {
                return {
                    ok: false,
                    errors: [
                        {
                            path: [],
                            message: "Not a Set",
                        },
                    ],
                };
            }
            const jsonList = await listSchema.json([...parsed], opts);
            return jsonList;
        },
        getType: () => SchemaType.SET,
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}
