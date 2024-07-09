import { assertNever } from "@fern-api/core-utils";
import {
    ObjectProperty,
    ObjectPropertyWithExample,
    OneOfSchema,
    OneOfSchemaWithExample,
    PrimitiveSchemaValue,
    PrimitiveSchemaValueWithExample,
    Schema,
    SchemaWithExample
} from "@fern-api/openapi-ir-sdk";

export function convertSchemaToSchemaWithExample(schema: Schema): SchemaWithExample {
    switch (schema.type) {
        case "object":
            return SchemaWithExample.object({
                allOf: schema.allOf,
                properties: schema.properties.map((objectProperty) => convertToObjectProperty(objectProperty)),
                allOfPropertyConflicts: schema.allOfPropertyConflicts,
                description: schema.description,
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                groupName: schema.groupName,
                fullExamples: undefined,
                additionalProperties: schema.additionalProperties
            });
        case "array":
            return SchemaWithExample.array({
                description: schema.description,
                value: convertSchemaToSchemaWithExample(schema.value),
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                groupName: schema.groupName,
                example: undefined
            });
        case "enum":
            return SchemaWithExample.enum({
                description: schema.description,
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                values: schema.values,
                groupName: schema.groupName,
                example: undefined
            });
        case "literal":
            return SchemaWithExample.literal({
                description: schema.description,
                value: schema.value,
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                groupName: schema.groupName
            });
        case "nullable":
            return SchemaWithExample.nullable({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                description: schema.description,
                value: convertSchemaToSchemaWithExample(schema.value),
                groupName: schema.groupName
            });
        case "optional":
            return SchemaWithExample.optional({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                description: schema.description,
                value: convertSchemaToSchemaWithExample(schema.value),
                groupName: schema.groupName
            });
        case "primitive":
            return SchemaWithExample.primitive({
                description: schema.description,
                schema: convertToPrimitiveSchemaValue(schema.schema),
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                groupName: schema.groupName
            });
        case "map":
            return SchemaWithExample.map({
                description: schema.description,
                key: SchemaWithExample.primitive({
                    description: schema.key.description,
                    schema: convertToPrimitiveSchemaValue(schema.key.schema),
                    generatedName: schema.key.generatedName,
                    nameOverride: schema.key.nameOverride,
                    groupName: schema.groupName
                }),
                value: convertSchemaToSchemaWithExample(schema.value),
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                groupName: schema.groupName,
                example: undefined
            });
        case "reference":
            return SchemaWithExample.reference({
                description: schema.description,
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                schema: schema.schema,
                groupName: schema.groupName
            });
        case "oneOf":
            return SchemaWithExample.oneOf(convertToOneOf(schema.value));
        case "unknown":
            return SchemaWithExample.unknown({
                nameOverride: schema.nameOverride,
                generatedName: schema.generatedName,
                example: undefined,
                groupName: undefined,
                description: undefined
            });
        default:
            assertNever(schema);
    }
}

export function convertSchemaWithExampleToOptionalSchema(schema: Schema): SchemaWithExample {
    switch (schema.type) {
        case "object":
        case "array":
        case "enum":
        case "literal":
        case "nullable":
        case "primitive":
        case "map":
        case "reference":
        case "unknown":
            return SchemaWithExample.optional({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                description: undefined,
                value: convertSchemaToSchemaWithExample(schema),
                groupName: undefined
            });
        case "optional":
            return SchemaWithExample.optional({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                description: schema.description,
                value: convertSchemaToSchemaWithExample(schema.value),
                groupName: schema.groupName
            });
        case "oneOf": {
            const oneOfSchema = convertToOneOf(schema.value);
            return SchemaWithExample.optional({
                generatedName: oneOfSchema.generatedName,
                nameOverride: oneOfSchema.nameOverride,
                description: oneOfSchema.description,
                value: SchemaWithExample.oneOf(convertToOneOf(schema.value)),
                groupName: oneOfSchema.groupName
            });
        }
        default:
            assertNever(schema);
    }
}

function convertToOneOf(oneOfSchema: OneOfSchema): OneOfSchemaWithExample {
    switch (oneOfSchema.type) {
        case "discriminated":
            return OneOfSchemaWithExample.discriminated({
                commonProperties: oneOfSchema.commonProperties.map((commonProperty) => {
                    return {
                        key: commonProperty.key,
                        schema: convertSchemaToSchemaWithExample(commonProperty.schema)
                    };
                }),
                description: oneOfSchema.description,
                discriminantProperty: oneOfSchema.discriminantProperty,
                generatedName: oneOfSchema.generatedName,
                nameOverride: oneOfSchema.nameOverride,
                schemas: Object.fromEntries(
                    Object.entries(oneOfSchema.schemas).map(([discriminantValue, schemaWithExample]) => {
                        return [discriminantValue, convertSchemaToSchemaWithExample(schemaWithExample)];
                    })
                ),
                groupName: oneOfSchema.groupName
            });
        case "undisciminated":
            return OneOfSchemaWithExample.undisciminated({
                description: oneOfSchema.description,
                generatedName: oneOfSchema.generatedName,
                nameOverride: oneOfSchema.nameOverride,
                schemas: oneOfSchema.schemas.map((oneOfSchema) => convertSchemaToSchemaWithExample(oneOfSchema)),
                groupName: oneOfSchema.groupName
            });
        default:
            assertNever(oneOfSchema);
    }
}

function convertToPrimitiveSchemaValue(primitiveSchema: PrimitiveSchemaValue): PrimitiveSchemaValueWithExample {
    switch (primitiveSchema.type) {
        case "string":
            return PrimitiveSchemaValueWithExample.string({
                default: primitiveSchema.default,
                pattern: primitiveSchema.pattern,
                format: primitiveSchema.format,
                minLength: primitiveSchema.minLength,
                maxLength: primitiveSchema.maxLength,
                example: undefined
            });
        case "base64":
            return PrimitiveSchemaValueWithExample.base64({
                example: undefined
            });
        case "boolean":
            return PrimitiveSchemaValueWithExample.boolean({
                default: primitiveSchema.default,
                example: undefined
            });
        case "date":
            return PrimitiveSchemaValueWithExample.date({
                example: undefined
            });
        case "datetime":
            return PrimitiveSchemaValueWithExample.datetime({
                example: undefined
            });
        case "double":
            return PrimitiveSchemaValueWithExample.double({
                default: primitiveSchema.default,
                minimum: primitiveSchema.minimum,
                maximum: primitiveSchema.maximum,
                exclusiveMinimum: primitiveSchema.exclusiveMinimum,
                exclusiveMaximum: primitiveSchema.exclusiveMaximum,
                multipleOf: primitiveSchema.multipleOf,
                example: undefined
            });
        case "float":
            return PrimitiveSchemaValueWithExample.float({
                example: undefined
            });
        case "int":
            return PrimitiveSchemaValueWithExample.int({
                default: primitiveSchema.default,
                minimum: primitiveSchema.minimum,
                maximum: primitiveSchema.maximum,
                exclusiveMinimum: primitiveSchema.exclusiveMinimum,
                exclusiveMaximum: primitiveSchema.exclusiveMaximum,
                multipleOf: primitiveSchema.multipleOf,
                example: undefined
            });
        case "int64":
            return PrimitiveSchemaValueWithExample.int64({
                default: primitiveSchema.default,
                example: undefined
            });
        default:
            assertNever(primitiveSchema);
    }
}

function convertToObjectProperty(objectProperty: ObjectProperty): ObjectPropertyWithExample {
    return {
        conflict: objectProperty.conflict,
        generatedName: objectProperty.generatedName,
        key: objectProperty.key,
        schema: convertSchemaToSchemaWithExample(objectProperty.schema),
        audiences: objectProperty.audiences,
        nameOverride: objectProperty.nameOverride
    };
}
