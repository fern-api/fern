import { Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { convertSchema } from "../convertSchemas";
import { convertEnum } from "./convertEnum";

export function convertUndiscriminatedOneOf({
    nameOverride,
    generatedName,
    breadcrumbs,
    description,
    wrapAsNullable,
    context,
    subtypes,
}: {
    nameOverride: string | undefined;
    generatedName: string;
    breadcrumbs: string[];
    description: string | undefined;
    wrapAsNullable: boolean;
    context: AbstractOpenAPIV3ParserContext;
    subtypes: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[];
}): Schema {
    const convertedSubtypes = subtypes.map((schema) => {
        return convertSchema(schema, false, context, [...breadcrumbs, nameOverride ?? generatedName]);
    });

    const everySubTypeIsLiteral = Object.entries(convertedSubtypes).every(([_, schema]) => {
        return schema.type === "literal";
    });
    if (everySubTypeIsLiteral) {
        const enumDescriptions: Record<string, { description: string }> = {};
        const enumValues: string[] = [];
        Object.entries(convertedSubtypes).forEach(([_, schema]) => {
            if (schema.type === "literal") {
                enumValues.push(schema.value);
                if (schema.description != null) {
                    enumDescriptions[schema.value] = {
                        description: schema.description,
                    };
                }
            }
        });
        return convertEnum({
            nameOverride,
            generatedName,
            wrapAsNullable,
            description,
            fernEnum: enumDescriptions,
            enumVarNames: undefined,
            enumValues,
        });
    }

    return wrapUndiscriminantedOneOf({
        nameOverride,
        generatedName,
        wrapAsNullable,
        description,
        subtypes: convertedSubtypes,
    });
}

export function wrapUndiscriminantedOneOf({
    nameOverride,
    generatedName,
    wrapAsNullable,
    description,
    subtypes,
}: {
    wrapAsNullable: boolean;
    nameOverride: string | undefined;
    generatedName: string;
    description: string | undefined;
    subtypes: Schema[];
}): Schema {
    if (wrapAsNullable) {
        return Schema.nullable({
            value: Schema.oneOf({
                type: "undisciminated",
                description,
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
