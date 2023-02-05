import { BaseSchema, MaybeValid, Schema, SchemaType, ValidationError } from "../../Schema";
import { MaybePromise } from "../../utils/MaybePromise";
import { getSchemaUtils } from "../schema-utils";

export function list<Raw, Parsed>(schema: Schema<Raw, Parsed>): Schema<Raw[], Parsed[]> {
    const baseSchema: BaseSchema<Raw[], Parsed[]> = {
        parse: async (raw, opts) => validateAndTransformArray(raw, (item) => schema.parse(item, opts)),
        json: (parsed, opts) => validateAndTransformArray(parsed, (item) => schema.json(item, opts)),
        getType: () => SchemaType.LIST,
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}

async function validateAndTransformArray<Raw, Parsed>(
    value: unknown,
    transformItem: (item: Raw) => MaybePromise<MaybeValid<Parsed>>
): Promise<MaybeValid<Parsed[]>> {
    if (!Array.isArray(value)) {
        return {
            ok: false,
            errors: [
                {
                    message: "Not a list",
                    path: [],
                },
            ],
        };
    }

    const maybeValidItems = await Promise.all(value.map((item) => transformItem(item)));

    return maybeValidItems.reduce<MaybeValid<Parsed[]>>(
        (acc, item, index) => {
            if (acc.ok && item.ok) {
                return {
                    ok: true,
                    value: [...acc.value, item.value],
                };
            }

            const errors: ValidationError[] = [];
            if (!acc.ok) {
                errors.push(...acc.errors);
            }
            if (!item.ok) {
                errors.push(
                    ...item.errors.map((error) => ({
                        path: [`[${index}]`, ...error.path],
                        message: error.message,
                    }))
                );
            }

            return {
                ok: false,
                errors,
            };
        },
        { ok: true, value: [] }
    );
}
