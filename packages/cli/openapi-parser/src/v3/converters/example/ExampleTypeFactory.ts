import { assertNever } from "@fern-api/core-utils";
import { SchemaId } from "@fern-fern/openapi-ir-model/commons";
import { FullExample, KeyValuePair, PrimitiveExample } from "@fern-fern/openapi-ir-model/example";
import {
    EnumSchemaWithExample,
    ObjectSchemaWithExample,
    PrimitiveSchemaValueWithExample,
    SchemaWithExample
} from "@fern-fern/openapi-ir-model/parseIr";
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
                return schema.values[0] != null ? FullExample.enum(schema.values[0]?.value) : undefined;
            case "literal":
                return FullExample.literal(schema.value);
            case "nullable":
                return this.buildExampleHelper({
                    schema: schema.value,
                    isOptional: true,
                    visitedSchemaIds,
                    example
                });
            case "optional":
                return this.buildExampleHelper({
                    schema: schema.value,
                    isOptional: true,
                    visitedSchemaIds,
                    example
                });
            case "primitive": {
                const primitiveExample = this.buildExampleFromPrimitive({ schema: schema.schema, example });
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
                return undefined;
            case "array": {
                const itemExample = this.buildExampleHelper({
                    example,
                    schema: schema.value,
                    isOptional: true,
                    visitedSchemaIds
                });
                if (isOptional) {
                    return itemExample != null ? FullExample.array([itemExample]) : undefined;
                }
                return itemExample != null ? FullExample.array([itemExample]) : FullExample.array([]);
            }
            case "map": {
                const objectExample = getFullExampleAsObject(example);
                if (objectExample != null && Object.entries(objectExample).length > 0) {
                    const kvs: KeyValuePair[] = [];
                    for (const [key, value] of Object.entries(objectExample)) {
                        const keyExample = this.buildExampleFromPrimitive({ schema: schema.key.schema, example: key });
                        const valueExample = this.buildExampleHelper({
                            example: value,
                            schema: schema.value,
                            isOptional: true,
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
                const keyExample = this.buildExampleFromPrimitive({ schema: schema.key.schema, example: undefined });
                const valueExample = this.buildExampleHelper({
                    example: undefined,
                    schema: schema.value,
                    isOptional: true,
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
                const fullExample =
                    getFullExampleAsObject(example) ??
                    (schema.fullExamples?.[0] != null ? getFullExampleAsObject(schema.fullExamples[0]) : {}) ??
                    {};
                const allProperties = this.getAllProperties(schema);
                const requiredProperties = this.getAllRequiredProperties(schema);
                for (const [property, schema] of Object.entries(allProperties)) {
                    const required = property in requiredProperties;
                    if (required && fullExample[property] != null) {
                        const propertyExample = this.buildExample(schema, fullExample[property]);
                        if (propertyExample != null) {
                            result[property] = propertyExample;
                        }
                    } else {
                        const propertyExample = this.buildExample(schema, undefined);
                        if (propertyExample != null) {
                            result[property] = propertyExample;
                        } else if (required) {
                            return undefined;
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

    private getAllRequiredProperties(object: ObjectSchemaWithExample): Record<string, SchemaWithExample> {
        let requiredProperties: Record<string, SchemaWithExample> = {};
        for (const property of object.properties) {
            const resolvedSchema = this.getResolvedSchema(property.schema);
            if (resolvedSchema.type !== "optional" && resolvedSchema.type !== "nullable") {
                requiredProperties[property.key] = property.schema;
            }
        }
        for (const allOf of object.allOf) {
            const allOfSchema = this.schemas[allOf.schema];
            if (allOfSchema?.type !== "object") {
                continue;
            }
            requiredProperties = {
                ...requiredProperties,
                ...this.getAllRequiredProperties(allOfSchema)
            };
        }
        return requiredProperties;
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
        example,
        schema
    }: {
        example: unknown | undefined;
        schema: PrimitiveSchemaValueWithExample;
    }): PrimitiveExample | undefined {
        switch (schema.type) {
            case "string":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.string(example);
                }
                return schema.example != null ? PrimitiveExample.string(schema.example) : undefined;
            case "base64":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.base64(example);
                }
                return schema.example != null ? PrimitiveExample.base64(schema.example) : undefined;
            case "boolean":
                if (example != null && typeof example === "boolean") {
                    return PrimitiveExample.boolean(example);
                }
                return schema.example != null ? PrimitiveExample.boolean(schema.example) : undefined;
            case "date":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.date(example);
                }
                return schema.example != null ? PrimitiveExample.date(schema.example) : undefined;
            case "datetime":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.datetime(example);
                }
                return schema.example != null ? PrimitiveExample.datetime(schema.example) : undefined;
            case "double":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.double(example);
                }
                return schema.example != null ? PrimitiveExample.double(schema.example) : undefined;
            case "float":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.float(example);
                }
                return schema.example != null ? PrimitiveExample.float(schema.example) : undefined;
            case "int":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.int(example);
                }
                return schema.example != null ? PrimitiveExample.int(schema.example) : undefined;
            case "int64":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.int64(example);
                }
                return schema.example != null ? PrimitiveExample.int64(schema.example) : undefined;
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
