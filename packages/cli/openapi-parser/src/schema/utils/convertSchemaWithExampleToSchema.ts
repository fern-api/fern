import { assertNever } from "@fern-api/core-utils";
import {
    FullExample,
    ObjectProperty,
    ObjectPropertyWithExample,
    OneOfSchema,
    OneOfSchemaWithExample,
    PrimitiveSchemaValue,
    PrimitiveSchemaValueWithExample,
    Schema,
    SchemaWithExample
} from "@fern-api/openapi-ir-sdk";
import { ExampleTypeFactory } from "../examples/ExampleTypeFactory";

export function convertSchemaWithExampleToSchema({
    schema,
    exampleTypeFactory
}: {
    schema: SchemaWithExample;
    exampleTypeFactory?: ExampleTypeFactory;
}): Schema {
    const examples: FullExample[] = [];
    exampleTypeFactory = exampleTypeFactory ?? new ExampleTypeFactory({});
    const example = exampleTypeFactory.buildExample({
        schema,
        exampleId: undefined,
        example: undefined,
        options: { ignoreOptionals: true, isParameter: false }
    });
    if (example != null) {
        examples.push(example);
    }
    switch (schema.type) {
        case "object":
            return Schema.object({
                allOf: schema.allOf,
                properties: schema.properties.map((objectProperty) =>
                    convertToObjectProperty({ objectProperty, exampleTypeFactory })
                ),
                allOfPropertyConflicts: schema.allOfPropertyConflicts,
                description: schema.description,
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                groupName: schema.groupName,
                additionalProperties: schema.additionalProperties,
                availability: schema.availability,
                examples
            });
        case "array":
            return Schema.array({
                description: schema.description,
                availability: schema.availability,
                value: convertSchemaWithExampleToSchema({ schema: schema.value, exampleTypeFactory }),
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                groupName: schema.groupName,
                examples
            });
        case "enum":
            return Schema.enum({
                description: schema.description,
                availability: schema.availability,
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                values: schema.values,
                groupName: schema.groupName,
                examples
            });
        case "literal":
            return Schema.literal({
                description: schema.description,
                availability: schema.availability,
                value: schema.value,
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                groupName: schema.groupName,
                examples
            });
        case "nullable":
            return Schema.nullable({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                description: schema.description,
                availability: schema.availability,
                value: convertSchemaWithExampleToSchema({ schema: schema.value, exampleTypeFactory }),
                groupName: schema.groupName,
                examples
            });
        case "optional":
            return Schema.optional({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                description: schema.description,
                availability: schema.availability,
                value: convertSchemaWithExampleToSchema({ schema: schema.value, exampleTypeFactory }),
                groupName: schema.groupName,
                examples
            });
        case "primitive":
            return Schema.primitive({
                description: schema.description,
                availability: schema.availability,
                schema: convertToPrimitiveSchemaValue(schema.schema),
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                groupName: schema.groupName,
                examples
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
                    nameOverride: schema.key.nameOverride,
                    groupName: schema.groupName,
                    examples: []
                }),
                value: convertSchemaWithExampleToSchema({ schema: schema.value, exampleTypeFactory }),
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                groupName: schema.groupName,
                examples
            });
        case "reference":
            return Schema.reference({
                description: schema.description,
                availability: schema.availability,
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                schema: schema.schema,
                groupName: schema.groupName
            });
        case "oneOf":
            return Schema.oneOf(convertToOneOf({ oneOfSchema: schema.value, exampleTypeFactory }));
        case "unknown":
            return Schema.unknown({ nameOverride: schema.nameOverride, generatedName: schema.generatedName });
        default:
            assertNever(schema);
    }
}

export function convertSchemaWithExampleToOptionalSchema({
    schema,
    exampleTypeFactory
}: {
    schema: SchemaWithExample;
    exampleTypeFactory: ExampleTypeFactory;
}): Schema {
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
                description: schema.description,
                availability: schema.availability,
                value: convertSchemaWithExampleToSchema({ schema: schema, exampleTypeFactory }),
                groupName: schema.groupName,
                examples: []
            });
        case "optional":
            return Schema.optional({
                generatedName: schema.generatedName,
                nameOverride: schema.nameOverride,
                description: schema.description,
                availability: schema.availability,
                value: convertSchemaWithExampleToSchema({ schema: schema.value, exampleTypeFactory }),
                groupName: schema.groupName,
                examples: []
            });
        case "oneOf": {
            const oneOfSchema = convertToOneOf({ oneOfSchema: schema.value, exampleTypeFactory });
            return Schema.optional({
                generatedName: oneOfSchema.generatedName,
                nameOverride: oneOfSchema.nameOverride,
                description: oneOfSchema.description,
                availability: oneOfSchema.availability,
                value: Schema.oneOf(oneOfSchema),
                groupName: oneOfSchema.groupName,
                examples: []
            });
        }
        default:
            assertNever(schema);
    }
}

function convertToOneOf({
    oneOfSchema,
    exampleTypeFactory
}: {
    oneOfSchema: OneOfSchemaWithExample;
    exampleTypeFactory: ExampleTypeFactory;
}): OneOfSchema {
    const examples: FullExample[] = [];
    const example = exampleTypeFactory.buildExample({
        schema: SchemaWithExample.oneOf(oneOfSchema),
        exampleId: undefined,
        example: undefined,
        options: { ignoreOptionals: true, isParameter: false }
    });
    if (example != null) {
        examples.push(example);
    }
    switch (oneOfSchema.type) {
        case "discriminated":
            return OneOfSchema.discriminated({
                commonProperties: oneOfSchema.commonProperties.map((commonProperty) => {
                    return {
                        key: commonProperty.key,
                        schema: convertSchemaWithExampleToSchema({ schema: commonProperty.schema, exampleTypeFactory })
                    };
                }),
                description: oneOfSchema.description,
                availability: oneOfSchema.availability,
                discriminantProperty: oneOfSchema.discriminantProperty,
                generatedName: oneOfSchema.generatedName,
                nameOverride: oneOfSchema.nameOverride,
                schemas: Object.fromEntries(
                    Object.entries(oneOfSchema.schemas).map(([discriminantValue, schemaWithExample]) => {
                        return [
                            discriminantValue,
                            convertSchemaWithExampleToSchema({ schema: schemaWithExample, exampleTypeFactory })
                        ];
                    })
                ),
                groupName: oneOfSchema.groupName,
                examples
            });
        case "undisciminated":
            return OneOfSchema.undisciminated({
                description: oneOfSchema.description,
                availability: oneOfSchema.availability,
                generatedName: oneOfSchema.generatedName,
                nameOverride: oneOfSchema.nameOverride,
                schemas: oneOfSchema.schemas.map((oneOfSchema) =>
                    convertSchemaWithExampleToSchema({ schema: oneOfSchema, exampleTypeFactory })
                ),
                groupName: oneOfSchema.groupName,
                examples
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
        default:
            assertNever(primitiveSchema);
    }
}

function convertToObjectProperty({
    objectProperty,
    exampleTypeFactory
}: {
    objectProperty: ObjectPropertyWithExample;
    exampleTypeFactory?: ExampleTypeFactory;
}): ObjectProperty {
    return {
        conflict: objectProperty.conflict,
        generatedName: objectProperty.generatedName,
        key: objectProperty.key,
        schema: convertSchemaWithExampleToSchema({ schema: objectProperty.schema, exampleTypeFactory }),
        audiences: objectProperty.audiences,
        nameOverride: objectProperty.nameOverride,
        availability: objectProperty.availability
    };
}
