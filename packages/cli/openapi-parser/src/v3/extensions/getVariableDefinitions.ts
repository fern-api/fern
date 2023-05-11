import { PrimitiveSchema, PrimitiveSchemaValue } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { X_FERN_SDK_VARIABLES } from "./extensions";

export function getVariableDefinitions(document: OpenAPIV3.Document): Record<string, PrimitiveSchema> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variables = (document as any)[X_FERN_SDK_VARIABLES] as undefined | Record<string, OpenAPIV3.SchemaObject>;

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
