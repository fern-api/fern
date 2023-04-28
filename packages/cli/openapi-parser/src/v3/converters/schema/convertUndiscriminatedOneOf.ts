import { Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3ParserContext } from "../../OpenAPIV3ParserContext";
import { convertSchema } from "../convertSchemas";

export function convertUndiscriminatedOneOf({
    schemaName,
    description,
    wrapAsOptional,
    context,
    subtypes,
}: {
    schemaName: string | undefined;
    description: string | undefined;
    wrapAsOptional: boolean;
    context: OpenAPIV3ParserContext;
    subtypes: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[];
}): Schema {
    const convertedSubtypes = subtypes.map((schema) => {
        return convertSchema(schema, false, context);
    });
    return wrapUndiscriminantedOneOf({
        wrapAsOptional,
        schemaName,
        description,
        subtypes: convertedSubtypes,
    });
}

export function wrapUndiscriminantedOneOf({
    wrapAsOptional,
    schemaName,
    description,
    subtypes,
}: {
    wrapAsOptional: boolean;
    schemaName: string | undefined;
    description: string | undefined;
    subtypes: Schema[];
}): Schema {
    if (wrapAsOptional) {
        return Schema.optional({
            value: Schema.oneOf({
                type: "undisciminated",
                description: undefined,
                name: schemaName,
                schemas: subtypes,
            }),
            description,
        });
    }
    return Schema.oneOf({
        type: "undisciminated",
        description,
        name: schemaName,
        schemas: subtypes,
    });
}
