import { PrimitiveSchema, PrimitiveSchemaValue } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { getGeneratedTypeName } from "../../../schema/utils/getSchemaName";
import { FernOpenAPIExtension } from "./fernExtensions";

export function getVariableDefinitions(document: OpenAPIV3.Document): Record<string, PrimitiveSchema> {
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
                        generatedName: getGeneratedTypeName([variableName]),
                        schema: PrimitiveSchemaValue.string({
                            minLength: undefined,
                            maxLength: undefined
                        }),
                        description: schema.description,
                        groupName: undefined
                    }
                ];
            } else {
                throw new Error(`Variable ${variableName} has unsupported schema ${JSON.stringify(schema)}`);
            }
        })
    );
}
