import { Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3ParserContext } from "../../OpenAPIV3ParserContext";
import { convertSchema } from "../convertSchemas";

export function convertUndiscriminatedOneOf({
    nameOverride,
    generatedName,
    breadcrumbs,
    description,
    wrapAsOptional,
    context,
    subtypes,
}: {
    nameOverride: string | undefined;
    generatedName: string;
    breadcrumbs: string[];
    description: string | undefined;
    wrapAsOptional: boolean;
    context: OpenAPIV3ParserContext;
    subtypes: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[];
}): Schema {
    const convertedSubtypes = subtypes.map((schema) => {
        return convertSchema(schema, false, context, [...breadcrumbs, nameOverride ?? generatedName]);
    });
    return wrapUndiscriminantedOneOf({
        nameOverride,
        generatedName,
        wrapAsOptional,
        description,
        subtypes: convertedSubtypes,
    });
}

export function wrapUndiscriminantedOneOf({
    nameOverride,
    generatedName,
    wrapAsOptional,
    description,
    subtypes,
}: {
    wrapAsOptional: boolean;
    nameOverride: string | undefined;
    generatedName: string;
    description: string | undefined;
    subtypes: Schema[];
}): Schema {
    if (wrapAsOptional) {
        return Schema.optional({
            value: Schema.oneOf({
                type: "undisciminated",
                description: undefined,
                nameOverride,
                generatedName,
                schemas: subtypes,
            }),
            description,
        });
    }
    return Schema.oneOf({
        type: "undisciminated",
        description,
        nameOverride,
        generatedName,
        schemas: subtypes,
    });
}
