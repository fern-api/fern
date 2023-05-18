import { PrimitiveSchema, PrimitiveSchemaValue } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension, getExtension } from "./extensions";

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
                return [variableName, { schema: PrimitiveSchemaValue.string(), description: schema.description }];
            } else {
                throw new Error(`Variable ${variableName} has unsupported schema ${JSON.stringify(schema)}`);
            }
        })
    );
}
