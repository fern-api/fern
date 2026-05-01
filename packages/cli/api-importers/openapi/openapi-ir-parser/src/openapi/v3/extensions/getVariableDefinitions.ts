import { PrimitiveSchema, PrimitiveSchemaValue } from "@fern-api/openapi-ir";
import { CliError } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension.js";
import { getDefaultAsString } from "../../../schema/defaults/getDefault.js";
import { getGeneratedTypeName } from "../../../schema/utils/getSchemaName.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

export function getVariableDefinitions(
    document: OpenAPIV3.Document,
    preserveSchemaIds: boolean
): Record<string, PrimitiveSchema> {
    const variables = getExtension<Record<string, OpenAPIV3.SchemaObject>>(
        document,
        FernOpenAPIExtension.SDK_VARIABLES
    );

    if (variables == null) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(variables).map(([variableName, schema]) => {
            if (schema.type === "string") {
                return [
                    variableName,
                    {
                        nameOverride: undefined,
                        generatedName: getGeneratedTypeName([variableName], preserveSchemaIds),
                        title: schema.title,
                        schema: PrimitiveSchemaValue.string({
                            default: getDefaultAsString(schema),
                            pattern: schema.pattern,
                            format: schema.format,
                            minLength: schema.minLength,
                            maxLength: schema.maxLength
                        }),
                        description: schema.description,
                        availability: undefined,
                        namespace: undefined,
                        groupName: undefined
                    }
                ];
            } else {
                throw new CliError({
                    message: `Variable ${variableName} has unsupported schema ${JSON.stringify(schema)}`,
                    code: CliError.Code.ValidationError
                });
            }
        })
    );
}
