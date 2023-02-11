import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "./utils";

export function convertSchema({ schema }: { schema: OpenAPIV3.SchemaObject }): FernOpenapiIr.Schema | undefined {
    if (schema.enum != null) {
        if (!isListOfStrings(schema.enum)) {
            return FernOpenapiIr.Schema.primitive(FernOpenapiIr.PrimitiveSchema.string());
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const enumNames = (schema as any)["x-enum-names"] as Record<string, string> | undefined;
        const convertedEnumValues: FernOpenapiIr.ir.EnumValue[] = schema.enum.map((value) => {
            return {
                value,
                name: enumNames != null ? enumNames[value] : undefined,
            };
        });
        return FernOpenapiIr.Schema.enum({
            description: schema.description,
            values: convertedEnumValues,
        });
    } else if (schema.type === "boolean") {
        return FernOpenapiIr.Schema.primitive({
            schema: FernOpenapiIr.PrimitiveSchemaValue.boolean(),
            description: schema.description,
        });
    } else if (schema.type === "integer") {
        return FernOpenapiIr.Schema.primitive({
            schema: FernOpenapiIr.PrimitiveSchemaValue.integer(),
            description: schema.description,
        });
    } else if (schema.type === "string") {
        return FernOpenapiIr.Schema.primitive({
            schema: FernOpenapiIr.PrimitiveSchemaValue.string(),
            description: schema.description,
        });
    } else if (schema.type === "object") {
        for (const [propertyName, propertyDefinition] of Object.entries(schema.properties ?? {})) {
            
            if (isReferenceObject(propertyDefinition)) {

            } else {

            }
        }
    }
    return undefined;
}

function isListOfStrings(x: unknown): x is string[] {
    return Array.isArray(x) && x.every((item) => typeof item === "string");
}
