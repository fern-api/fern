import { assertNever } from "@fern-api/core-utils";
import { ObjectProperty, OneOfSchema, PrimitiveSchemaValue, Schema } from "@fern-fern/openapi-ir-model/finalIr";
import {
    ObjectPropertyWithExample,
    OneOfSchemaWithExample,
    PrimitiveSchemaValueWithExample,
    SchemaWithExample
} from "@fern-fern/openapi-ir-model/parseIr";

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
                groupName: schema.groupName
            });
        case "array":
            return Schema.array({
                description: schema.description,
                value: convertSchemaWithExampleToSchema(schema.value),
                groupName: schema.groupName
            });
        case "enum":
            return Schema.enum({
                description: schema.description,
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                values: schema.values,
                groupName: schema.groupName
            });
        case "literal":
            return Schema.literal({
                description: schema.description,
                value: schema.value,
                groupName: schema.groupName
            });
        case "nullable":
            return Schema.nullable({
                description: schema.description,
                value: convertSchemaWithExampleToSchema(schema.value),
                groupName: schema.groupName
            });
        case "optional":
            return Schema.optional({
                description: schema.description,
                value: convertSchemaWithExampleToSchema(schema.value),
                groupName: schema.groupName
            });
        case "primitive":
            return Schema.primitive({
                description: schema.description,
                schema: convertToPrimitiveSchemaValue(schema.schema),
                groupName: schema.groupName
            });
        case "map":
            return Schema.map({
                description: schema.description,
                key: Schema.primitive({
                    description: schema.key.description,
                    schema: convertToPrimitiveSchemaValue(schema.key.schema),
                    groupName: schema.groupName
                }),
                value: convertSchemaWithExampleToSchema(schema.value),
                groupName: schema.groupName
            });
        case "reference":
            return Schema.reference({
                description: schema.description,
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                schema: schema.schema,
                groupName: schema.groupName
            });
        case "oneOf":
            return Schema.oneOf(convertToOneOf(schema.oneOf));
        case "unknown":
            return Schema.unknown();
        default:
            assertNever(schema);
    }
}

function convertToOneOf(oneOfSchema: OneOfSchemaWithExample): OneOfSchema {
    switch (oneOfSchema.type) {
        case "discriminated":
            return {
                type: "discriminated",
                commonProperties: oneOfSchema.commonProperties.map((commonProperty) => {
                    return {
                        key: commonProperty.key,
                        schema: convertSchemaWithExampleToSchema(commonProperty.schema)
                    };
                }),
                description: oneOfSchema.description,
                discriminantProperty: oneOfSchema.discriminantProperty,
                generatedName: oneOfSchema.generatedName,
                nameOverride: oneOfSchema.nameOverride,
                schemas: Object.fromEntries(
                    Object.entries(oneOfSchema.schemas).map(([discriminantValue, schemaWithExample]) => {
                        return [discriminantValue, convertSchemaWithExampleToSchema(schemaWithExample)];
                    })
                ),
                groupName: oneOfSchema.groupName
            };
        case "undisciminated":
            return {
                type: "undisciminated",
                description: oneOfSchema.description,
                generatedName: oneOfSchema.generatedName,
                nameOverride: oneOfSchema.nameOverride,
                schemas: oneOfSchema.schemas.map((oneOfSchema) => convertSchemaWithExampleToSchema(oneOfSchema)),
                groupName: oneOfSchema.groupName
            };
        default:
            assertNever(oneOfSchema);
    }
}

function convertToPrimitiveSchemaValue(primitiveSchema: PrimitiveSchemaValueWithExample): PrimitiveSchemaValue {
    switch (primitiveSchema.type) {
        case "string":
            return PrimitiveSchemaValue.string({
                maxLength: primitiveSchema.maxLength,
                minLength: primitiveSchema.minLength
            });
        case "base64":
            return PrimitiveSchemaValue.base64();
        case "boolean":
            return PrimitiveSchemaValue.boolean();
        case "date":
            return PrimitiveSchemaValue.date();
        case "datetime":
            return PrimitiveSchemaValue.datetime();
        case "double":
            return PrimitiveSchemaValue.double();
        case "float":
            return PrimitiveSchemaValue.float();
        case "int":
            return PrimitiveSchemaValue.int();
        case "int64":
            return PrimitiveSchemaValue.int64();
        default:
            assertNever(primitiveSchema);
    }
}

function convertToObjectProperty(objectProperty: ObjectPropertyWithExample): ObjectProperty {
    return {
        conflict: objectProperty.conflict,
        generatedName: objectProperty.generatedName,
        key: objectProperty.key,
        schema: convertSchemaWithExampleToSchema(objectProperty.schema)
    };
}
