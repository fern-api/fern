import { BaseSchema, MaybeValid, Schema, SchemaType, ValidationError } from "../../Schema";
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
                (schema) => schema.parse(raw, opts),
                schemas
            );
        },
        json: async (parsed, opts) => {
            return validateAndTransformUndiscriminatedUnion<inferRawUnidiscriminatedUnionSchema<Schemas>>(
                (schema) => schema.json(parsed, opts),
                schemas
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
    transform: (schema: Schema<any, any>) => MaybePromise<MaybeValid<Transformed>>,
    schemas: Schema<any, any>[]
): Promise<MaybeValid<Transformed>> {
    const errors: ValidationError[] = [];
    for (const [index, schema] of schemas.entries()) {
        const transformed = await transform(schema);
        if (transformed.ok) {
            return transformed;
        } else {
            for (const error of errors) {
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
