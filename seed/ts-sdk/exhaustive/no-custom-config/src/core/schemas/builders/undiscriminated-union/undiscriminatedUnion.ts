import { BaseSchema, MaybeValid, Schema, SchemaOptions, SchemaType, ValidationError } from "../../Schema";
import { MaybePromise } from "../../utils/MaybePromise";
import { maybeSkipValidation } from "../../utils/maybeSkipValidation";
import { getSchemaUtils } from "../schema-utils";
import { inferParsedUnidiscriminatedUnionSchema, inferRawUnidiscriminatedUnionSchema } from "./types";

export function undiscriminatedUnion<Schemas extends [Schema<any, any>, ...Schema<any, any>[]]>(
    schemas: Schemas
): Schema<inferRawUnidiscriminatedUnionSchema<Schemas>, inferParsedUnidiscriminatedUnionSchema<Schemas>> {
    const baseSchema: BaseSchema<
        inferRawUnidiscriminatedUnionSchema<Schemas>,
        inferParsedUnidiscriminatedUnionSchema<Schemas>
    > = {
        parse: async (raw, opts) => {
            return validateAndTransformUndiscriminatedUnion<inferParsedUnidiscriminatedUnionSchema<Schemas>>(
                (schema, opts) => schema.parse(raw, opts),
                schemas,
                opts
            );
        },
        json: async (parsed, opts) => {
            return validateAndTransformUndiscriminatedUnion<inferRawUnidiscriminatedUnionSchema<Schemas>>(
                (schema, opts) => schema.json(parsed, opts),
                schemas,
                opts
            );
        },
        getType: () => SchemaType.UNDISCRIMINATED_UNION,
    };

    return {
        ...maybeSkipValidation(baseSchema),
        ...getSchemaUtils(baseSchema),
    };
}

async function validateAndTransformUndiscriminatedUnion<Transformed>(
    transform: (schema: Schema<any, any>, opts: SchemaOptions) => MaybePromise<MaybeValid<Transformed>>,
    schemas: Schema<any, any>[],
    opts: SchemaOptions | undefined
): Promise<MaybeValid<Transformed>> {
    const errors: ValidationError[] = [];
    for (const [index, schema] of schemas.entries()) {
        const transformed = await transform(schema, { ...opts, skipValidation: false });
        if (transformed.ok) {
            return transformed;
        } else {
            for (const error of transformed.errors) {
                errors.push({
                    path: error.path,
                    message: `[Variant ${index}] ${error.message}`,
                });
            }
        }
    }

    return {
        ok: false,
        errors,
    };
}
