import { TaskContext } from "@fern-api/task-context";
import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getSchemaIdFromReference, isReferenceObject } from "./utils";

export function convertSchema({
    schema,
    taskContext,
}: {
    schema: OpenAPIV3.SchemaObject;
    taskContext: TaskContext;
}): FernOpenapiIr.Schema | undefined {
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
    } else if (schema.type === "number") {
        return FernOpenapiIr.Schema.primitive({
            schema: FernOpenapiIr.PrimitiveSchemaValue.number(),
            description: schema.description,
        });
    } else if (schema.type === "array") {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (schema.items == null || Object.entries(schema.items).length === 0) {
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
                taskContext.logger.warn(`Failed to convert array item ${schema.items.$ref}`);
            }
        } else {
            const convertedSchema = convertSchema({ schema: schema.items, taskContext });
            if (convertedSchema != null) {
                return FernOpenapiIr.Schema.array({
                    value: convertedSchema,
                    description: schema.description,
                });
            } else {
                taskContext.logger.warn(`Failed to convert array item ${JSON.stringify(schema.items)}`);
            }
        }
    } else if (schema.type === "object" || schema.allOf != null) {
        const objectSchema: FernOpenapiIr.ObjectSchema = {
            allOf: [],
            properties: [],
        };

        schema.allOf?.map((parent) => {
            if (isReferenceObject(parent)) {
                const schemaId = getSchemaIdFromReference(parent);
                if (schemaId != null) {
                    const referencedSchema = FernOpenapiIr.Schema.reference({
                        reference: schemaId,
                    });
                    objectSchema.allOf.push(referencedSchema);
                } else {
                    taskContext.logger.warn(`Failed to convert allOf ${parent.$ref}`);
                }
            } else {
                const convertedSchema = convertSchema({ schema: parent, taskContext });
                if (convertedSchema != null) {
                    objectSchema.allOf.push(convertedSchema);
                } else {
                    taskContext.logger.warn(`Failed to convert allOf ${JSON.stringify(parent)}`);
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
                    taskContext.logger.warn(`Failed to convert property ${propertyName} ${propertyDefinition.$ref}`);
                }
            } else {
                const schema = convertSchema({ schema: propertyDefinition, taskContext });
                if (schema != null) {
                    objectSchema.properties.push({
                        key: propertyName,
                        schema: isRequired ? schema : FernOpenapiIr.Schema.optional({ value: schema }),
                        description: propertyDefinition.description,
                    });
                } else {
                    taskContext.logger.warn(`Failed to convert property ${propertyName} ${JSON.stringify(schema)}`);
                }
            }
        }
        return FernOpenapiIr.Schema.object(objectSchema);
    } else if (schema.oneOf != null) {
        const subTypes: FernOpenapiIr.Schema[] = [];
        for (const subType of schema.oneOf) {
            if (isReferenceObject(subType)) {
                const schemaId = getSchemaIdFromReference(subType);
                if (schemaId != null) {
                    subTypes.push(
                        FernOpenapiIr.Schema.reference({
                            reference: schemaId,
                        })
                    );
                } else {
                    taskContext.logger.warn(`Failed to read oneOf ${subType.$ref}`);
                }
            } else {
                const convertedSchema = convertSchema({ schema: subType, taskContext });
                if (convertedSchema != null) {
                    subTypes.push(convertedSchema);
                } else {
                    taskContext.logger.warn(`Failed to convert oneOf ${JSON.stringify(subType)}`);
                }
            }
        }
        return FernOpenapiIr.Schema.oneOf(
            FernOpenapiIr.OneOfSchema.undisciminated({
                schemas: subTypes,
            })
        );
    }
    return undefined;
}

function isListOfStrings(x: unknown): x is string[] {
    return Array.isArray(x) && x.every((item) => typeof item === "string");
}
