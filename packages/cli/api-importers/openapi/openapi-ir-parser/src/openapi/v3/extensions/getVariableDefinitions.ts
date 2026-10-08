import { PrimitiveSchemaValue, SdkVariable } from "@fern-api/openapi-ir";
import { CliError } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension.js";
import { getDefaultAsString } from "../../../schema/defaults/getDefault.js";
import { getGeneratedTypeName } from "../../../schema/utils/getSchemaName.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

export function getVariableDefinitions(
    document: OpenAPIV3.Document,
    preserveSchemaIds: boolean
): Record<string, SdkVariable> {
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
                        schema: {
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
                        },
                        envVar: getVariableEnvVar(variableName, schema)
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

function getVariableEnvVar(variableName: string, schema: OpenAPIV3.SchemaObject): string | undefined {
    const envVar = getExtension<unknown>(schema, FernOpenAPIExtension.SDK_VARIABLE_ENV);
    if (envVar == null) {
        return undefined;
    }
    const trimmed = typeof envVar === "string" ? envVar.trim() : undefined;
    if (trimmed == null || trimmed.length === 0) {
        throw new CliError({
            message: `Variable ${variableName} has invalid ${FernOpenAPIExtension.SDK_VARIABLE_ENV}: expected a non-empty string but got ${JSON.stringify(envVar)}`,
            code: CliError.Code.ValidationError
        });
    }
    return trimmed;
}
