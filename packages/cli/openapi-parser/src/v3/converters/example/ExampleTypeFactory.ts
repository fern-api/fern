import { assertNever } from "@fern-api/core-utils";
import { SchemaId } from "@fern-fern/openapi-ir-model/commons";
import { FullExample, KeyValuePair, PrimitiveExample } from "@fern-fern/openapi-ir-model/example";
import {
    EnumSchemaWithExample,
    ObjectSchemaWithExample,
    PrimitiveSchemaValueWithExample,
    SchemaWithExample
} from "@fern-fern/openapi-ir-model/parseIr";
import { convertToFullExample } from "./convertToFullExample";
import { getFullExampleAsObject } from "./getFullExample";

export class ExampleTypeFactory {
    private schemas: Record<SchemaId, SchemaWithExample>;

    constructor(schemas: Record<SchemaId, SchemaWithExample>) {
        this.schemas = schemas;
    }

    public buildExample(schema: SchemaWithExample, example: unknown | undefined): FullExample | undefined {
        return this.buildExampleHelper({ schema, isOptional: false, visitedSchemaIds: new Set(), example });
    }

    private buildExampleHelper({
        example,
        schema,
        isOptional,
        visitedSchemaIds
    }: {
        example: unknown | undefined;
        schema: SchemaWithExample;
        isOptional: boolean;
        visitedSchemaIds: Set<SchemaId>;
    }): FullExample | undefined {
        switch (schema.type) {
            case "enum":
                if (typeof example === "string" && enumContainsValue({ schema, value: example })) {
                    return FullExample.enum(example);
                }
                return schema.values[0] != null ? FullExample.enum(schema.values[0].value) : undefined;
            case "literal":
                return FullExample.literal(schema.value);
            case "nullable":
            case "optional":
                return this.buildExampleHelper({
                    schema: schema.value,
                    isOptional: true,
                    visitedSchemaIds,
                    example
                });
            case "primitive": {
                const primitiveExample = this.buildExampleFromPrimitive({ schema: schema.schema, example, isOptional });
                return primitiveExample != null ? FullExample.primitive(primitiveExample) : undefined;
            }
            case "reference": {
                const referencedSchemaWithExample = this.schemas[schema.schema];
                if (referencedSchemaWithExample != null && !visitedSchemaIds.has(schema.schema)) {
                    visitedSchemaIds.add(schema.schema);
                    const referencedExample = this.buildExampleHelper({
                        example,
                        schema: referencedSchemaWithExample,
                        isOptional,
                        visitedSchemaIds
                    });
                    visitedSchemaIds.delete(schema.schema);
                    return referencedExample;
                }
                return undefined;
            }
            case "oneOf":
                return undefined;
            case "unknown":
                if (example != null) {
                    const fullExample = convertToFullExample(example);
                    if (fullExample != null) {
                        return FullExample.unknown(fullExample);
                    }
                }
                if (isOptional) {
                    return undefined;
                } else {
                    return FullExample.map([]);
                }
            case "array": {
                const itemExample = this.buildExampleHelper({
                    example,
                    schema: schema.value,
                    isOptional: false,
                    visitedSchemaIds
                });
                return itemExample != null
                    ? FullExample.array([itemExample])
                    : !isOptional
                    ? FullExample.array([])
                    : undefined;
            }
            case "map": {
                const objectExample = getFullExampleAsObject(example);
                if (objectExample != null && Object.entries(objectExample).length > 0) {
                    const kvs: KeyValuePair[] = [];
                    for (const [key, value] of Object.entries(objectExample)) {
                        const keyExample = this.buildExampleFromPrimitive({
                            schema: schema.key.schema,
                            example: key,
                            isOptional
                        });
                        const valueExample = this.buildExampleHelper({
                            example: value,
                            schema: schema.value,
                            isOptional,
                            visitedSchemaIds
                        });
                        if (keyExample != null && valueExample != null) {
                            kvs.push({
                                key: keyExample,
                                value: valueExample
                            });
                        }
                    }
                    return FullExample.map(kvs);
                }
                const keyExample = this.buildExampleFromPrimitive({
                    schema: schema.key.schema,
                    example: undefined,
                    isOptional
                });
                const valueExample = this.buildExampleHelper({
                    example: undefined,
                    schema: schema.value,
                    isOptional,
                    visitedSchemaIds
                });
                if (keyExample != null && valueExample != null) {
                    return FullExample.map([
                        {
                            key: keyExample,
                            value: valueExample
                        }
                    ]);
                }
                return isOptional ? undefined : FullExample.map([]);
            }
            case "object": {
                const result: Record<string, FullExample> = {};
                const unvalidatedExampleObject =
                    getFullExampleAsObject(example) ??
                    (schema.fullExamples?.[0] != null ? getFullExampleAsObject(schema.fullExamples[0]) : {}) ??
                    {};
                const allProperties = this.getAllProperties(schema);
                const requiredPropertyKeys = new Set(this.getAllRequiredPropertyKeys(schema));
                for (const [propertyKey, propertySchema] of Object.entries(allProperties)) {
                    const required = requiredPropertyKeys.has(propertyKey);
                    const propertyExample = this.buildExampleHelper({
                        schema: propertySchema,
                        example: unvalidatedExampleObject[propertyKey],
                        isOptional: !required,
                        visitedSchemaIds
                    });
                    if (propertyExample == null) {
                        if (required) {
                            // cannot build example
                            return undefined;
                        } else {
                            continue;
                        }
                    }
                }
                return FullExample.object({
                    properties: result
                });
            }
            default:
                assertNever(schema);
        }
    }

    private getAllProperties(object: ObjectSchemaWithExample): Record<string, SchemaWithExample> {
        let properties: Record<string, SchemaWithExample> = {};
        for (const property of object.properties) {
            properties[property.key] = property.schema;
        }
        for (const allOf of object.allOf) {
            const allOfSchema = this.schemas[allOf.schema];
            if (allOfSchema?.type !== "object") {
                continue;
            }
            properties = {
                ...properties,
                ...this.getAllProperties(allOfSchema)
            };
        }
        return properties;
    }

    private getAllRequiredPropertyKeys(object: ObjectSchemaWithExample): string[] {
        const requiredProperyKeys: string[] = [];
        for (const property of object.properties) {
            const resolvedSchema = this.getResolvedSchema(property.schema);
            if (resolvedSchema.type !== "optional" && resolvedSchema.type !== "nullable") {
                requiredProperyKeys.push(property.key);
            }
        }
        for (const allOf of object.allOf) {
            const allOfSchema = this.schemas[allOf.schema];
            if (allOfSchema?.type !== "object") {
                continue;
            }
            requiredProperyKeys.push(...this.getAllRequiredPropertyKeys(allOfSchema));
        }
        return requiredProperyKeys;
    }

    private getResolvedSchema(schema: SchemaWithExample) {
        while (schema.type === "reference") {
            const resolvedSchema = this.schemas[schema.schema];
            if (resolvedSchema == null) {
                throw new Error(`Unexpected error: Failed to resolve schema reference: ${schema.schema}`);
            }
            schema = resolvedSchema;
        }
        return schema;
    }

    private buildExampleFromPrimitive({
        isOptional,
        example,
        schema
    }: {
        isOptional: boolean;
        example: unknown | undefined;
        schema: PrimitiveSchemaValueWithExample;
    }): PrimitiveExample | undefined {
        switch (schema.type) {
            case "string":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.string(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.string(schema.example);
                } else if (!isOptional) {
                    return PrimitiveExample.string("string");
                }
                return undefined;
            case "base64":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.base64(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.base64(schema.example);
                } else if (!isOptional) {
                    return PrimitiveExample.base64("SGVsbG8gd29ybGQh");
                }
                return undefined;
            case "boolean":
                if (example != null && typeof example === "boolean") {
                    return PrimitiveExample.boolean(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.boolean(schema.example);
                } else if (!isOptional) {
                    return PrimitiveExample.boolean(true);
                }
                return undefined;
            case "date":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.date(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.date(schema.example);
                } else if (!isOptional) {
                    return PrimitiveExample.date("2023-01-15");
                }
                return undefined;
            case "datetime":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.datetime(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.datetime(schema.example);
                } else if (!isOptional) {
                    return PrimitiveExample.datetime("2024-01-15T09:30:00Z");
                }
                return undefined;
            case "double":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.double(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.double(schema.example);
                } else if (!isOptional) {
                    return PrimitiveExample.double(1.1);
                }
                return undefined;
            case "float":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.float(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.float(schema.example);
                } else if (!isOptional) {
                    return PrimitiveExample.float(1.1);
                }
                return undefined;
            case "int":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.int(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.int(1);
                } else if (!isOptional) {
                    return PrimitiveExample.int(1);
                }
                return undefined;
            case "int64":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.int64(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.int64(schema.example);
                } else if (!isOptional) {
                    return PrimitiveExample.int64(1000000);
                }
                return undefined;
            default:
                assertNever(schema);
        }
    }
}

function enumContainsValue({ schema, value }: { schema: EnumSchemaWithExample; value: string }): boolean {
    return schema.values
        .map((enumValue) => {
            return enumValue.value;
        })
        .includes(value);
}
