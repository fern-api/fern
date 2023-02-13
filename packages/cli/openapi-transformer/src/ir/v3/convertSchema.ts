import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getSchemaIdFromReference, isReferenceObject } from "./utils";

export function convertSchema({ schema }: { schema: OpenAPIV3.SchemaObject }): FernOpenapiIr.Schema | undefined {
    if (schema.enum != null) {
        if (!isListOfStrings(schema.enum)) {
            return FernOpenapiIr.Schema.primitive({ schema: FernOpenapiIr.PrimitiveSchemaValue.string() });
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
    } else if (schema.type === "array") {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (schema.items == null) {
            return FernOpenapiIr.Schema.array({
                value: FernOpenapiIr.Schema.unknown({}),
                description: schema.description,
            });
        } else if (isReferenceObject(schema.items)) {
            const schemaId = getSchemaIdFromReference(schema.items);
            if (schemaId != null) {
                const referencedSchema = FernOpenapiIr.Schema.reference({
                    reference: schemaId,
                });
                return FernOpenapiIr.Schema.array({
                    value: FernOpenapiIr.Schema.array({
                        value: referencedSchema,
                    }),
                    description: schema.description,
                });
            } else {
                // TODO(dsinghvi): log that reference as skipped
            }
        } else {
            const convertedSchema = convertSchema({ schema: schema.items });
            if (convertedSchema != null) {
                return FernOpenapiIr.Schema.array({
                    value: FernOpenapiIr.Schema.array({
                        value: convertedSchema,
                        description: schema.description,
                    }),
                    description: schema.description,
                });
            } else {
                // TODO(dsinghvi): log that we failed to convert array boxed item
            }
        }
    } else if (schema.type === "object") {
        const objectSchema: FernOpenapiIr.ObjectSchema = {
            allOf: [],
            properties: [],
        };

        schema.allOf?.map((parent, index) => {
            if (isReferenceObject(parent)) {
                const schemaId = getSchemaIdFromReference(parent);
                if (schemaId != null) {
                    const referencedSchema = FernOpenapiIr.Schema.reference({
                        reference: schemaId,
                    });
                    objectSchema.allOf.push(referencedSchema);
                } else {
                    // TODO(dsinghvi): log that allOf was skipped
                }
            } else {
                const convertedSchema = convertSchema({ schema: parent });
                if (convertedSchema != null) {
                    objectSchema.allOf.push(convertedSchema);
                } else {
                    // TODO(dsinghvi): log that allOf was skipped
                }
            }
        });

        for (const [propertyName, propertyDefinition] of Object.entries(schema.properties ?? {})) {
            const isRequired = schema.required != null && schema.required.includes(propertyName);
            if (isReferenceObject(propertyDefinition)) {
                const schemaId = getSchemaIdFromReference(propertyDefinition);
                if (schemaId != null) {
                    const referencedSchema = FernOpenapiIr.Schema.reference({
                        reference: schemaId,
                    });
                    objectSchema.properties.push({
                        key: propertyName,
                        schema: isRequired
                            ? referencedSchema
                            : FernOpenapiIr.Schema.optional({ value: referencedSchema }),
                    });
                } else {
                    //TODO(dsinghvi): log that we skipped a property
                }
            } else {
                const schema = convertSchema({ schema: propertyDefinition });
                if (schema != null) {
                    objectSchema.properties.push({
                        key: propertyName,
                        schema: isRequired ? schema : FernOpenapiIr.Schema.optional({ value: schema }),
                        description: propertyDefinition.description,
                    });
                } else {
                    //TODO(dsinghvi): log that we skipped a property
                }
            }
        }
        return FernOpenapiIr.Schema.object(objectSchema);
    }
    return undefined;
}

function isListOfStrings(x: unknown): x is string[] {
    return Array.isArray(x) && x.every((item) => typeof item === "string");
}
