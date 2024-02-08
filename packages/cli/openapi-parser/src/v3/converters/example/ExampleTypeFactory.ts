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
import { getFullExampleAsArray, getFullExampleAsObject } from "./getFullExample";

export declare namespace ExampleTypeFactory {
    interface Options {
        /* Name of the field the example is being generated for */
        name?: string;
        /*
         * Max number of levels to generate optional properties for.
         * Becomes 0 if ignoreOptionals is true.
         */
        maxDepth?: number;
        ignoreOptionals: boolean;
        /* True if example is for query or path parameter */
        isParameter: boolean;
    }
}

export class ExampleTypeFactory {
    private schemas: Record<SchemaId, SchemaWithExample>;

    constructor(schemas: Record<SchemaId, SchemaWithExample>) {
        this.schemas = schemas;
    }

    public buildExample({
        schema,
        example,
        options
    }: {
        schema: SchemaWithExample;
        example: unknown | undefined;
        options: ExampleTypeFactory.Options;
    }): FullExample | undefined {
        return this.buildExampleHelper({ schema, visitedSchemaIds: new Set(), example, options, depth: 0 });
    }

    private buildExampleHelper({
        example,
        schema,
        depth,
        visitedSchemaIds,
        options
    }: {
        example: unknown | undefined;
        schema: SchemaWithExample;
        depth: number;
        visitedSchemaIds: Set<SchemaId>;
        options: ExampleTypeFactory.Options;
    }): FullExample | undefined {
        switch (schema.type) {
            case "enum":
                if (typeof example === "string" && enumContainsValue({ schema, value: example })) {
                    return FullExample.enum(example);
                }
                return schema.values[0] != null ? FullExample.enum(schema.values[0]?.value) : undefined;
            case "literal":
                return FullExample.literal(schema.value);
            case "nullable": {
                if (
                    example == null &&
                    !this.hasExample(schema.value) &&
                    (options.ignoreOptionals || this.exceedsMaxDepth(depth, options))
                ) {
                    return undefined;
                }
                const result = this.buildExampleHelper({
                    schema: schema.value,
                    visitedSchemaIds,
                    example,
                    depth,
                    options
                });
                if (result != null && result.type === "array" && result.array.length === 0) {
                    return undefined;
                }
                if (result != null && result.type === "map" && result.map.length === 0) {
                    return undefined;
                }
                if (result != null && result.type === "object" && Object.keys(result.properties).length === 0) {
                    return undefined;
                }
                return result;
            }
            case "optional": {
                if (
                    example == null &&
                    !this.hasExample(schema.value) &&
                    (options.ignoreOptionals || this.exceedsMaxDepth(depth, options))
                ) {
                    return undefined;
                }
                const result = this.buildExampleHelper({
                    schema: schema.value,
                    visitedSchemaIds,
                    example,
                    depth,
                    options
                });
                if (result != null && result.type === "array" && result.array.length === 0) {
                    return undefined;
                }
                if (result != null && result.type === "map" && result.map.length === 0) {
                    return undefined;
                }
                if (result != null && result.type === "object" && Object.keys(result.properties).length === 0) {
                    return undefined;
                }
                return result;
            }
            case "primitive": {
                const primitiveExample = this.buildExampleFromPrimitive({ schema: schema.schema, example, options });
                return FullExample.primitive(primitiveExample);
            }
            case "reference": {
                const referencedSchemaWithExample = this.schemas[schema.schema];
                if (referencedSchemaWithExample != null && !visitedSchemaIds.has(schema.schema)) {
                    visitedSchemaIds.add(schema.schema);
                    const referencedExample = this.buildExampleHelper({
                        example,
                        schema: referencedSchemaWithExample,
                        visitedSchemaIds,
                        depth,
                        options
                    });
                    visitedSchemaIds.delete(schema.schema);
                    return referencedExample;
                }
                return undefined;
            }
            case "oneOf":
                switch (schema.oneOf.type) {
                    case "discriminated": {
                        const result: Record<string, FullExample> = {};

                        let allProperties: Record<string, SchemaWithExample> = {};
                        let requiredProperties: Record<string, SchemaWithExample> = {};

                        const fullExample = getFullExampleAsObject(example);
                        const exampleDiscriminant = fullExample?.[schema.oneOf.discriminantProperty];
                        const exampleUnionVariantSchema = schema.oneOf.schemas[exampleDiscriminant];

                        const firstUnionVariant = Object.entries(schema.oneOf.schemas)[0];
                        if (
                            exampleDiscriminant != null &&
                            exampleUnionVariantSchema != null &&
                            exampleUnionVariantSchema.type === "object"
                        ) {
                            allProperties = this.getAllProperties(exampleUnionVariantSchema);
                            requiredProperties = this.getAllRequiredProperties(exampleUnionVariantSchema);
                            result[schema.oneOf.discriminantProperty] = FullExample.primitive(
                                PrimitiveExample.string(exampleDiscriminant)
                            );
                        } else if (firstUnionVariant != null && firstUnionVariant[1].type === "object") {
                            allProperties = this.getAllProperties(firstUnionVariant[1]);
                            requiredProperties = this.getAllRequiredProperties(firstUnionVariant[1]);
                            result[schema.oneOf.discriminantProperty] = FullExample.primitive(
                                PrimitiveExample.string(firstUnionVariant[0])
                            );
                        } else {
                            return undefined;
                        }

                        for (const commonProperty of schema.oneOf.commonProperties) {
                            allProperties[commonProperty.key] = commonProperty.schema;
                            const resolvedSchema = this.getResolvedSchema(commonProperty.schema);
                            if (resolvedSchema.type !== "optional" && resolvedSchema.type !== "nullable") {
                                requiredProperties[commonProperty.key] = commonProperty.schema;
                            }
                        }

                        for (const [property, schema] of Object.entries(allProperties)) {
                            const required = property in requiredProperties;
                            if (required && fullExample?.[property] != null) {
                                const propertyExample = this.buildExampleHelper({
                                    schema,
                                    example: fullExample[property],
                                    visitedSchemaIds,
                                    depth: depth + 1,
                                    options
                                });
                                if (propertyExample != null) {
                                    result[property] = propertyExample;
                                } else {
                                    return undefined;
                                }
                            } else {
                                const propertyExample = this.buildExampleHelper({
                                    schema,
                                    example: fullExample?.[property],
                                    visitedSchemaIds,
                                    depth: depth + 1,
                                    options
                                });
                                if (propertyExample != null) {
                                    result[property] = propertyExample;
                                } else if (required) {
                                    return undefined;
                                }
                            }
                        }
                        return FullExample.oneOf({
                            type: "discriminated",
                            discriminated: result
                        });
                    }
                    case "undisciminated": {
                        if (schema.oneOf.schemas[0] != null) {
                            // TODO (we should select the oneOf schema based on the example)
                            return this.buildExampleHelper({
                                example,
                                schema: schema.oneOf.schemas[0],
                                visitedSchemaIds,
                                depth,
                                options
                            });
                        }
                        break;
                    }
                }
                return undefined;
            case "unknown":
                if (example != null) {
                    const fullExample = convertToFullExample(example);
                    if (fullExample != null) {
                        return FullExample.unknown(fullExample);
                    }
                }
                if (options.ignoreOptionals || this.exceedsMaxDepth(depth, options)) {
                    return undefined;
                }
                if (options.isParameter) {
                    return FullExample.primitive(PrimitiveExample.string(options.name ?? "string"));
                }
                return FullExample.map([
                    {
                        key: PrimitiveExample.string("key"),
                        value: FullExample.primitive(PrimitiveExample.string("value"))
                    }
                ]);
            case "array": {
                const fullExample = getFullExampleAsArray(example);
                const itemExamples = [];
                for (const item of fullExample ?? []) {
                    const itemExample = this.buildExampleHelper({
                        example: item,
                        schema: schema.value,
                        depth: depth + 1,
                        visitedSchemaIds,
                        options
                    });
                    if (itemExample != null) {
                        itemExamples.push(itemExample);
                    }
                }
                return FullExample.array(itemExamples);
            }
            case "map": {
                const objectExample = getFullExampleAsObject(example);
                if (objectExample != null && Object.entries(objectExample).length > 0) {
                    const kvs: KeyValuePair[] = [];
                    for (const [key, value] of Object.entries(objectExample)) {
                        const keyExample = this.buildExampleFromPrimitive({
                            schema: schema.key.schema,
                            example: key,
                            options
                        });
                        const valueExample = this.buildExampleHelper({
                            example: value,
                            schema: schema.value,
                            visitedSchemaIds,
                            depth: depth + 1,
                            options
                        });
                        if (valueExample != null) {
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
                    options
                });
                const valueExample = this.buildExampleHelper({
                    example: undefined,
                    schema: schema.value,
                    visitedSchemaIds,
                    depth: depth + 1,
                    options
                });
                if (valueExample != null) {
                    return FullExample.map([
                        {
                            key: keyExample,
                            value: valueExample
                        }
                    ]);
                }
                return FullExample.map([]);
            }
            case "object": {
                const result: Record<string, FullExample> = {};
                const fullExample =
                    getFullExampleAsObject(example) ??
                    (schema.fullExamples?.[0] != null ? getFullExampleAsObject(schema.fullExamples[0].value) : {}) ??
                    {};
                const allProperties = this.getAllProperties(schema);
                const requiredProperties = this.getAllRequiredProperties(schema);
                for (const [property, schema] of Object.entries(allProperties)) {
                    const required = property in requiredProperties;
                    const propertyExample = this.buildExampleHelper({
                        schema,
                        example: fullExample[property],
                        visitedSchemaIds,
                        depth: depth + 1,
                        options: {
                            ...options,
                            name: property
                        }
                    });
                    if (propertyExample != null) {
                        result[property] = propertyExample;
                    } else if (required) {
                        const generatedExample = this.buildExampleHelper({
                            schema,
                            example: fullExample[property],
                            visitedSchemaIds,
                            depth: depth + 1,
                            options: {
                                ...options,
                                name: property
                            }
                        });
                        if (generatedExample == null) {
                            return undefined;
                        }
                        result[property] = generatedExample;
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

    private hasExample(schema: SchemaWithExample): boolean {
        switch (schema.type) {
            case "array":
                return this.hasExample(schema.value);
            case "enum":
                return schema.example != null;
            case "literal":
                return false;
            case "map":
                return schema.key.schema.example != null && this.hasExample(schema.value);
            case "object": {
                const objectExample = schema.fullExamples != null && schema.fullExamples.length > 0;
                if (objectExample) {
                    return true;
                }
                for (const property of schema.properties) {
                    if (this.hasExample(property.schema)) {
                        return true;
                    }
                }
                return false;
            }
            case "primitive":
                return schema.schema.example != null;
            case "reference": {
                const resolvedSchema = this.schemas[schema.schema];
                if (resolvedSchema != null) {
                    return this.hasExample(resolvedSchema);
                }
                return false;
            }
            case "unknown":
                return schema.example != null;
            case "oneOf":
                return Object.values(schema.oneOf.schemas).some((schema) => this.hasExample(schema));
            default:
                return false;
        }
    }

    private exceedsMaxDepth(depth: number, options: ExampleTypeFactory.Options): boolean {
        return depth > (options.maxDepth ?? 0);
    }

    private getAllProperties(object: ObjectSchemaWithExample): Record<string, SchemaWithExample> {
        let properties: Record<string, SchemaWithExample> = {};
        for (const property of object.properties) {
            properties[property.key] = property.schema;
        }
        for (const allOf of object.allOf) {
            const allOfSchema = this.schemas[allOf.schema];
            if (allOfSchema == null) {
                continue;
            }
            const resolvedAllOfSchema = this.getResolvedSchema(allOfSchema);
            if (resolvedAllOfSchema.type !== "object") {
                continue;
            }
            properties = {
                ...this.getAllProperties(resolvedAllOfSchema),
                ...properties
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
            if (allOfSchema == null) {
                continue;
            }
            const resolvedAllOfSchema = this.getResolvedSchema(allOfSchema);
            if (resolvedAllOfSchema.type !== "object") {
                continue;
            }
            requiredProperties = {
                ...this.getAllRequiredProperties(resolvedAllOfSchema),
                ...requiredProperties
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
        schema,
        options
    }: {
        example: unknown | undefined;
        schema: PrimitiveSchemaValueWithExample;
        options: ExampleTypeFactory.Options;
    }): PrimitiveExample {
        switch (schema.type) {
            case "string":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.string(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.string(schema.example);
                } else {
                    return PrimitiveExample.string(options.name ?? "string");
                }
            case "base64":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.base64(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.base64(schema.example);
                } else {
                    return PrimitiveExample.base64("SGVsbG8gd29ybGQh");
                }
            case "boolean":
                if (example != null && typeof example === "boolean") {
                    return PrimitiveExample.boolean(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.boolean(schema.example);
                } else {
                    return PrimitiveExample.boolean(true);
                }
            case "date":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.date(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.date(schema.example);
                } else {
                    return PrimitiveExample.date("2023-01-15");
                }
            case "datetime":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.datetime(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.datetime(schema.example);
                } else {
                    return PrimitiveExample.datetime("2024-01-15T09:30:00Z");
                }
            case "double":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.double(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.double(schema.example);
                } else {
                    return PrimitiveExample.double(1.1);
                }
            case "float":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.float(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.float(schema.example);
                } else {
                    return PrimitiveExample.float(1.1);
                }
            case "int":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.int(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.int(1);
                } else {
                    return PrimitiveExample.int(1);
                }
            case "int64":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.int64(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.int64(schema.example);
                } else {
                    return PrimitiveExample.int64(1000000);
                }
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
