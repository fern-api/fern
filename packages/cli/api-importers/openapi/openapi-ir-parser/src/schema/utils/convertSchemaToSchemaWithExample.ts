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
} from "@fern-api/openapi-ir";

export function convertSchemaToSchemaWithExample(schema: Schema): SchemaWithExample {
    switch (schema.type) {
        case "object":
            return SchemaWithExample.object({
                allOf: schema.allOf,
                properties: schema.properties.map((objectProperty) => convertToObjectProperty(objectProperty)),
                allOfPropertyConflicts: schema.allOfPropertyConflicts,
                description: schema.description,
                generatedName: schema.generatedName,
                title: schema.title,
                nameOverride: schema.nameOverride,
                namespace: schema.namespace,
                groupName: schema.groupName,
                fullExamples: undefined,
                additionalProperties: schema.additionalProperties,
                availability: schema.availability,
                source: schema.source,
                inline: undefined
            });
        case "array":
            return SchemaWithExample.array({
                description: schema.description,
                availability: schema.availability,
                value: convertSchemaToSchemaWithExample(schema.value),
                generatedName: schema.generatedName,
                title: schema.title,
                namespace: schema.namespace,
                nameOverride: schema.nameOverride,
                groupName: schema.groupName,
                example: undefined,
                inline: undefined
            });
        case "enum":
            return SchemaWithExample.enum({
                description: schema.description,
                availability: schema.availability,
                generatedName: schema.generatedName,
                title: schema.title,
                nameOverride: schema.nameOverride,
                values: schema.values,
                default: schema.default,
                namespace: schema.namespace,
                groupName: schema.groupName,
                example: undefined,
                source: schema.source,
                inline: undefined
            });
        case "literal":
            return SchemaWithExample.literal({
                description: schema.description,
                availability: schema.availability,
                value: schema.value,
                generatedName: schema.generatedName,
                title: schema.title,
                nameOverride: schema.nameOverride,
                namespace: schema.namespace,
                groupName: schema.groupName
            });
        case "nullable":
            return SchemaWithExample.nullable({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                description: schema.description,
                availability: schema.availability,
                value: convertSchemaToSchemaWithExample(schema.value),
                namespace: schema.namespace,
                groupName: schema.groupName,
                inline: undefined
            });
        case "optional":
            return SchemaWithExample.optional({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                description: schema.description,
                availability: schema.availability,
                value: convertSchemaToSchemaWithExample(schema.value),
                namespace: schema.namespace,
                groupName: schema.groupName,
                inline: undefined
            });
        case "primitive":
            return SchemaWithExample.primitive({
                description: schema.description,
                availability: schema.availability,
                schema: convertToPrimitiveSchemaValue(schema.schema),
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                namespace: schema.namespace,
                groupName: schema.groupName
            });
        case "map":
            return SchemaWithExample.map({
                description: schema.description,
                availability: schema.availability,
                key: SchemaWithExample.primitive({
                    description: schema.key.description,
                    availability: schema.key.availability,
                    schema: convertToPrimitiveSchemaValue(schema.key.schema),
                    generatedName: schema.key.generatedName,
                    nameOverride: schema.key.nameOverride,
                    title: schema.key.title,
                    namespace: schema.namespace,
                    groupName: schema.groupName
                }),
                value: convertSchemaToSchemaWithExample(schema.value),
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                namespace: schema.namespace,
                groupName: schema.groupName,
                encoding: schema.encoding,
                example: undefined,
                inline: undefined
            });
        case "reference":
            return SchemaWithExample.reference({
                description: schema.description,
                availability: schema.availability,
                generatedName: schema.generatedName,
                title: schema.title,
                nameOverride: schema.nameOverride,
                schema: schema.schema,
                namespace: schema.namespace,
                groupName: schema.groupName,
                source: schema.source
            });
        case "oneOf":
            return SchemaWithExample.oneOf(convertToOneOf(schema.value));
        case "unknown":
            return SchemaWithExample.unknown({
                nameOverride: schema.nameOverride,
                generatedName: schema.generatedName,
                title: undefined,
                example: undefined,
                namespace: undefined,
                groupName: undefined,
                description: undefined,
                availability: undefined
            });
        default:
            assertNever(schema);
    }
}

export function convertSchemaWithExampleToOptionalSchema(schema: Schema): SchemaWithExample {
    switch (schema.type) {
        case "unknown":
            return SchemaWithExample.optional({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: undefined,
                description: undefined,
                availability: undefined,
                value: convertSchemaToSchemaWithExample(schema),
                namespace: undefined,
                groupName: undefined,
                inline: undefined
            });
        case "object":
        case "array":
        case "enum":
        case "literal":
        case "nullable":
        case "primitive":
        case "map":
        case "reference":
            return SchemaWithExample.optional({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                description: undefined,
                availability: schema.availability,
                value: convertSchemaToSchemaWithExample(schema),
                namespace: undefined,
                groupName: undefined,
                inline: undefined
            });
        case "optional":
            return SchemaWithExample.optional({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                description: schema.description,
                availability: schema.availability,
                value: convertSchemaToSchemaWithExample(schema.value),
                namespace: schema.namespace,
                groupName: schema.groupName,
                inline: undefined
            });
        case "oneOf": {
            const oneOfSchema = convertToOneOf(schema.value);
            return SchemaWithExample.optional({
                generatedName: oneOfSchema.generatedName,
                nameOverride: oneOfSchema.nameOverride,
                title: oneOfSchema.title,
                description: oneOfSchema.description,
                availability: oneOfSchema.availability,
                value: SchemaWithExample.oneOf(convertToOneOf(schema.value)),
                namespace: oneOfSchema.namespace,
                groupName: oneOfSchema.groupName,
                inline: undefined
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
                availability: oneOfSchema.availability,
                discriminantProperty: oneOfSchema.discriminantProperty,
                generatedName: oneOfSchema.generatedName,
                nameOverride: oneOfSchema.nameOverride,
                title: oneOfSchema.title,
                schemas: Object.fromEntries(
                    Object.entries(oneOfSchema.schemas).map(([discriminantValue, schemaWithExample]) => {
                        return [discriminantValue, convertSchemaToSchemaWithExample(schemaWithExample)];
                    })
                ),
                namespace: oneOfSchema.namespace,
                groupName: oneOfSchema.groupName,
                encoding: oneOfSchema.encoding,
                source: oneOfSchema.source,
                inline: undefined
            });
        case "undiscriminated":
            return OneOfSchemaWithExample.undiscriminated({
                description: oneOfSchema.description,
                availability: oneOfSchema.availability,
                generatedName: oneOfSchema.generatedName,
                nameOverride: oneOfSchema.nameOverride,
                title: oneOfSchema.title,
                schemas: oneOfSchema.schemas.map((oneOfSchema) => convertSchemaToSchemaWithExample(oneOfSchema)),
                namespace: oneOfSchema.namespace,
                groupName: oneOfSchema.groupName,
                encoding: oneOfSchema.encoding,
                source: oneOfSchema.source,
                inline: undefined
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
        case "uint":
            return PrimitiveSchemaValueWithExample.uint({
                default: undefined,
                example: undefined
            });
        case "uint64":
            return PrimitiveSchemaValueWithExample.uint64({
                default: undefined,
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
        nameOverride: objectProperty.nameOverride,
        availability: objectProperty.availability,
        readonly: objectProperty.readonly,
        writeonly: objectProperty.writeonly
    };
}
