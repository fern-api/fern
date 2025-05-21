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

export function convertSchemaWithExampleToSchema(schema: SchemaWithExample): Schema {
    switch (schema.type) {
        case "object":
            return Schema.object({
                allOf: schema.allOf,
                properties: schema.properties.map((objectProperty) => convertToObjectProperty(objectProperty)),
                allOfPropertyConflicts: schema.allOfPropertyConflicts,
                description: schema.description,
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                namespace: schema.namespace,
                groupName: schema.groupName,
                additionalProperties: schema.additionalProperties,
                availability: schema.availability,
                source: schema.source,
                inline: schema.inline
            });
        case "array":
            return Schema.array({
                description: schema.description,
                availability: schema.availability,
                value: convertSchemaWithExampleToSchema(schema.value),
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                namespace: schema.namespace,
                groupName: schema.groupName,
                inline: schema.inline
            });
        case "enum":
            return Schema.enum({
                description: schema.description,
                availability: schema.availability,
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                values: schema.values,
                default: schema.default,
                namespace: schema.namespace,
                groupName: schema.groupName,
                source: schema.source,
                inline: schema.inline
            });
        case "literal":
            return Schema.literal({
                description: schema.description,
                availability: schema.availability,
                value: schema.value,
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                namespace: schema.namespace,
                groupName: schema.groupName
            });
        case "nullable":
            return Schema.nullable({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                description: schema.description,
                availability: schema.availability,
                value: convertSchemaWithExampleToSchema(schema.value),
                namespace: schema.namespace,
                groupName: schema.groupName,
                inline: schema.inline
            });
        case "optional":
            return Schema.optional({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                description: schema.description,
                availability: schema.availability,
                value: convertSchemaWithExampleToSchema(schema.value),
                namespace: schema.namespace,
                groupName: schema.groupName,
                inline: schema.inline
            });
        case "primitive":
            return Schema.primitive({
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
            return Schema.map({
                description: schema.description,
                availability: schema.availability,
                key: Schema.primitive({
                    description: schema.key.description,
                    availability: schema.key.availability,
                    schema: convertToPrimitiveSchemaValue(schema.key.schema),
                    generatedName: schema.key.generatedName,
                    title: schema.key.title,
                    nameOverride: schema.key.nameOverride,
                    namespace: schema.namespace,
                    groupName: schema.groupName
                }),
                value: convertSchemaWithExampleToSchema(schema.value),
                generatedName: schema.generatedName,
                title: schema.title,
                nameOverride: schema.nameOverride,
                namespace: schema.namespace,
                groupName: schema.groupName,
                encoding: schema.encoding,
                inline: schema.inline
            });
        case "reference":
            return Schema.reference({
                description: schema.description,
                availability: schema.availability,
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                schema: schema.schema,
                namespace: schema.namespace,
                groupName: schema.groupName,
                source: schema.source
            });
        case "oneOf":
            return Schema.oneOf(convertToOneOf(schema.value));
        case "unknown":
            return Schema.unknown({ nameOverride: schema.nameOverride, generatedName: schema.generatedName });
        default:
            assertNever(schema);
    }
}

export function convertSchemaWithExampleToOptionalSchema(schema: SchemaWithExample): Schema {
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
            return Schema.optional({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                description: schema.description,
                availability: schema.availability,
                value: convertSchemaWithExampleToSchema(schema),
                namespace: schema.namespace,
                groupName: schema.groupName,
                inline: undefined
            });
        case "optional":
            return Schema.optional({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                title: schema.title,
                description: schema.description,
                availability: schema.availability,
                value: convertSchemaWithExampleToSchema(schema.value),
                namespace: schema.namespace,
                groupName: schema.groupName,
                inline: schema.inline
            });
        case "oneOf": {
            const oneOfSchema = convertToOneOf(schema.value);
            return Schema.optional({
                generatedName: oneOfSchema.generatedName,
                nameOverride: oneOfSchema.nameOverride,
                title: oneOfSchema.title,
                description: oneOfSchema.description,
                availability: oneOfSchema.availability,
                value: Schema.oneOf(convertToOneOf(schema.value)),
                namespace: oneOfSchema.namespace,
                groupName: oneOfSchema.groupName,
                inline: oneOfSchema.inline
            });
        }
        default:
            assertNever(schema);
    }
}

function convertToOneOf(oneOfSchema: OneOfSchemaWithExample): OneOfSchema {
    switch (oneOfSchema.type) {
        case "discriminated":
            return OneOfSchema.discriminated({
                commonProperties: oneOfSchema.commonProperties.map((commonProperty) => {
                    return {
                        key: commonProperty.key,
                        schema: convertSchemaWithExampleToSchema(commonProperty.schema)
                    };
                }),
                description: oneOfSchema.description,
                availability: oneOfSchema.availability,
                discriminantProperty: oneOfSchema.discriminantProperty,
                generatedName: oneOfSchema.generatedName,
                title: oneOfSchema.title,
                nameOverride: oneOfSchema.nameOverride,
                schemas: Object.fromEntries(
                    Object.entries(oneOfSchema.schemas).map(([discriminantValue, schemaWithExample]) => {
                        return [discriminantValue, convertSchemaWithExampleToSchema(schemaWithExample)];
                    })
                ),
                namespace: oneOfSchema.namespace,
                groupName: oneOfSchema.groupName,
                encoding: oneOfSchema.encoding,
                source: oneOfSchema.source,
                inline: oneOfSchema.inline
            });
        case "undiscriminated":
            return OneOfSchema.undiscriminated({
                description: oneOfSchema.description,
                availability: oneOfSchema.availability,
                generatedName: oneOfSchema.generatedName,
                title: oneOfSchema.title,
                nameOverride: oneOfSchema.nameOverride,
                schemas: oneOfSchema.schemas.map((oneOfSchema) => convertSchemaWithExampleToSchema(oneOfSchema)),
                namespace: oneOfSchema.namespace,
                groupName: oneOfSchema.groupName,
                encoding: oneOfSchema.encoding,
                source: oneOfSchema.source,
                inline: oneOfSchema.inline
            });
        default:
            assertNever(oneOfSchema);
    }
}

function convertToPrimitiveSchemaValue(primitiveSchema: PrimitiveSchemaValueWithExample): PrimitiveSchemaValue {
    switch (primitiveSchema.type) {
        case "string":
            return PrimitiveSchemaValue.string(primitiveSchema);
        case "base64":
            return PrimitiveSchemaValue.base64();
        case "boolean":
            return PrimitiveSchemaValue.boolean(primitiveSchema);
        case "date":
            return PrimitiveSchemaValue.date();
        case "datetime":
            return PrimitiveSchemaValue.datetime();
        case "double":
            return PrimitiveSchemaValue.double(primitiveSchema);
        case "float":
            return PrimitiveSchemaValue.float();
        case "int":
            return PrimitiveSchemaValue.int(primitiveSchema);
        case "int64":
            return PrimitiveSchemaValue.int64(primitiveSchema);
        case "uint":
            return PrimitiveSchemaValue.uint();
        case "uint64":
            return PrimitiveSchemaValue.uint64();
        default:
            assertNever(primitiveSchema);
    }
}

function convertToObjectProperty(objectProperty: ObjectPropertyWithExample): ObjectProperty {
    return {
        conflict: objectProperty.conflict,
        generatedName: objectProperty.generatedName,
        key: objectProperty.key,
        schema: convertSchemaWithExampleToSchema(objectProperty.schema),
        audiences: objectProperty.audiences,
        nameOverride: objectProperty.nameOverride,
        availability: objectProperty.availability,
        readonly: objectProperty.readonly,
        writeonly: objectProperty.writeonly
    };
}
