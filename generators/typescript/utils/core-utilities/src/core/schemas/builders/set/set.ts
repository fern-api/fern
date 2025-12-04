import { type BaseSchema, type Schema, SchemaType } from "../../Schema";
import { addJsonSerializer } from "../../utils/addJsonSerializer";
import { getErrorMessageForIncorrectType } from "../../utils/getErrorMessageForIncorrectType";
import { maybeSkipValidation } from "../../utils/maybeSkipValidation";
import { list } from "../list/index";
import { getSchemaUtils } from "../schema-utils/index";

export function set<Raw, Parsed>(schema: Schema<Raw, Parsed>): Schema<Raw[], Set<Parsed>> {
    const listSchema = list(schema);
    const baseSchema: BaseSchema<Raw[], Set<Parsed>> = {
        parse: (raw, opts) => {
            const parsedList = listSchema.parse(raw, opts);
            if (parsedList.ok) {
                const setInstance = new Set(parsedList.value);
                addJsonSerializer(setInstance, function () {
                    return [...this];
                });
                return {
                    ok: true,
                    value: setInstance
                };
            } else {
                return parsedList;
            }
        },
        json: (parsed, opts) => {
            if (!(parsed instanceof Set)) {
                return {
                    ok: false,
                    errors: [
                        {
                            path: opts?.breadcrumbsPrefix ?? [],
                            message: getErrorMessageForIncorrectType(parsed, "Set")
                        }
                    ]
                };
            }
            const jsonList = listSchema.json([...parsed], opts);
            return jsonList;
        },
        getType: () => SchemaType.SET
    };

    return {
        ...maybeSkipValidation(baseSchema),
        ...getSchemaUtils(baseSchema)
    };
}
