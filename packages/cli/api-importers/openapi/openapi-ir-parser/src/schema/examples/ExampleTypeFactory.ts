import { Examples, assertNever, isPlainObject } from "@fern-api/core-utils";
import {
    EnumSchemaWithExample,
    FernOpenapiIr,
    FullExample,
    FullOneOfExample,
    KeyValuePair,
    ObjectSchemaWithExample,
    PrimitiveExample,
    PrimitiveSchemaValueWithExample,
    SchemaId,
    SchemaWithExample
} from "@fern-api/openapi-ir";

import { SchemaParserContext } from "../SchemaParserContext";
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

        maxCheckerDepth?: number;
    }
}

export class ExampleTypeFactory {
    constructor(
        private readonly schemas: Record<SchemaId, SchemaWithExample>,
        private readonly nonRequestReferencedSchemas: Set<SchemaId>,
        private readonly context: SchemaParserContext
    ) {}

    public buildExample({
        schema,
        exampleId,
        example,
        options,
        skipReadonly
    }: {
        schema: SchemaWithExample;
        exampleId: string | undefined;
        example: unknown | undefined;
        options: ExampleTypeFactory.Options;
        skipReadonly?: boolean;
    }): FullExample | undefined {
        return this.buildExampleHelper({
            schema,
            visitedSchemaIds: new Set(),
            exampleId,
            example,
            // Default maxCheckerDepth to 5
            options: { ...options, maxCheckerDepth: options.maxCheckerDepth ?? 5 },
            depth: 0,
            skipReadonly: skipReadonly ?? false
        });
    }

    private buildExampleHelper({
        exampleId,
        example,
        schema,
        depth,
        visitedSchemaIds,
        options,
        skipReadonly
    }: {
        exampleId: string | undefined;
        example: unknown | undefined;
        schema: SchemaWithExample;
        depth: number;
        visitedSchemaIds: Set<SchemaId>;
        options: ExampleTypeFactory.Options;
        skipReadonly: boolean;
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
                    !this.hasExample(schema.value, 0, visitedSchemaIds, options) &&
                    (options.ignoreOptionals || this.exceedsMaxDepth(depth, options))
                ) {
                    return undefined;
                }
                const result = this.buildExampleHelper({
                    schema: schema.value,
                    visitedSchemaIds,
                    exampleId,
                    example,
                    depth,
                    options,
                    skipReadonly
                });
                if (result != null && result.type === "array" && result.value.length === 0) {
                    return undefined;
                }
                if (result != null && result.type === "map" && result.value.length === 0) {
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
                    !this.hasExample(schema.value, 0, visitedSchemaIds, options) &&
                    (options.ignoreOptionals || this.exceedsMaxDepth(depth, options))
                ) {
                    return undefined;
                }
                if (Object.is(example, null)) {
                    return undefined;
                }
                const result = this.buildExampleHelper({
                    schema: schema.value,
                    visitedSchemaIds,
                    exampleId,
                    example,
                    depth,
                    options,
                    skipReadonly
                });
                if (result != null && result.type === "array" && result.value.length === 0) {
                    return undefined;
                }
                if (result != null && result.type === "map" && result.value.length === 0) {
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

                    const isInlinedRequest =
                        referencedSchemaWithExample?.type === "object" &&
                        !this.nonRequestReferencedSchemas.has(schema.schema);

                    const referencedExample = this.buildExampleHelper({
                        example,
                        schema: referencedSchemaWithExample,
                        exampleId,
                        visitedSchemaIds,
                        depth,
                        options,
                        // by default we respect readonly on inlined requests
                        skipReadonly:
                            isInlinedRequest || this.context.options.respectReadonlySchemas ? skipReadonly : false
                    });
                    visitedSchemaIds.delete(schema.schema);
                    return referencedExample;
                }
                return undefined;
            }
            case "oneOf":
                switch (schema.value.type) {
                    case "discriminated": {
                        const result: Record<string, FullExample> = {};

                        let allProperties: Record<string, { schema: SchemaWithExample; readonly: boolean }> = {};
                        let requiredProperties: Record<string, SchemaWithExample> = {};

                        const fullExample = getFullExampleAsObject(example);
                        const exampleDiscriminant = fullExample?.[schema.value.discriminantProperty];
                        const exampleUnionVariantSchema = schema.value.schemas[exampleDiscriminant];

                        // Pick the union variant from the example, othwerise try each of them until one works
                        const unionVariants = [];

                        const schemaFromExample = this.getDiscriminatedUnionVariantSchema(schema.value, fullExample);
                        if (schemaFromExample != null) {
                            unionVariants.push(schemaFromExample);
                        }

                        unionVariants.push(...Object.entries(schema.value.schemas));

                        for (const unionVariant of unionVariants) {
                            if (
                                exampleDiscriminant != null &&
                                exampleUnionVariantSchema != null &&
                                exampleUnionVariantSchema.type === "object"
                            ) {
                                allProperties = this.getAllProperties(exampleUnionVariantSchema);
                                requiredProperties = this.getAllRequiredProperties(exampleUnionVariantSchema);
                                result[schema.value.discriminantProperty] = FullExample.primitive(
                                    PrimitiveExample.string(exampleDiscriminant)
                                );
                                break;
                            } else {
                                const objectSchema = this.getObjectSchema(unionVariant[1]);
                                if (objectSchema == null) {
                                    continue;
                                }
                                allProperties = this.getAllProperties(objectSchema);
                                requiredProperties = this.getAllRequiredProperties(objectSchema);
                                result[schema.value.discriminantProperty] = FullExample.primitive(
                                    PrimitiveExample.string(unionVariant[0])
                                );
                            }
                        }

                        for (const commonProperty of schema.value.commonProperties) {
                            allProperties[commonProperty.key] = { schema: commonProperty.schema, readonly: false };
                            const resolvedSchema = this.getResolvedSchema(commonProperty.schema);
                            if (resolvedSchema.type !== "optional" && resolvedSchema.type !== "nullable") {
                                requiredProperties[commonProperty.key] = commonProperty.schema;
                            }
                        }

                        for (const [property, schema] of Object.entries(allProperties)) {
                            const required = property in requiredProperties;
                            if (required && fullExample?.[property] != null) {
                                const propertyExample = this.buildExampleHelper({
                                    schema: schema.schema,
                                    exampleId,
                                    example: fullExample[property],
                                    visitedSchemaIds,
                                    depth: depth + 1,
                                    options,
                                    skipReadonly
                                });
                                if (propertyExample != null) {
                                    result[property] = propertyExample;
                                } else {
                                    return undefined;
                                }
                            } else {
                                const propertyExample = this.buildExampleHelper({
                                    exampleId,
                                    schema: schema.schema,
                                    example: fullExample?.[property],
                                    visitedSchemaIds,
                                    depth: depth + 1,
                                    options,
                                    skipReadonly
                                });
                                if (propertyExample != null) {
                                    result[property] = propertyExample;
                                } else if (required) {
                                    return undefined;
                                }
                            }
                        }
                        return FullExample.oneOf(FullOneOfExample.discriminated(result));
                    }
                    case "undisciminated": {
                        const unionVariantSchema = this.getUnDiscriminatedUnionVariantSchema(schema.value, example);
                        if (unionVariantSchema != null) {
                            // TODO (we should select the oneOf schema based on the example)
                            return this.buildExampleHelper({
                                exampleId,
                                example,
                                schema: unionVariantSchema,
                                visitedSchemaIds,
                                depth,
                                options,
                                skipReadonly
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
                // If you have a top-level example use that
                if (fullExample != null && fullExample.length > 0) {
                    for (const item of fullExample) {
                        const itemExample = this.buildExampleHelper({
                            exampleId,
                            example: item,
                            schema: schema.value,
                            depth: depth + 1,
                            visitedSchemaIds,
                            options,
                            skipReadonly
                        });
                        if (itemExample != null) {
                            itemExamples.push(itemExample);
                        }
                    }
                    // Otherwise, use a schema level example
                } else if (schema.example != null && schema.example.length > 0) {
                    for (const item of schema.example) {
                        const itemExample = this.buildExampleHelper({
                            exampleId,
                            example: item,
                            schema: schema.value,
                            depth: depth + 1,
                            visitedSchemaIds,
                            options,
                            skipReadonly
                        });
                        if (itemExample != null) {
                            itemExamples.push(itemExample);
                        }
                    }
                    // Otherwise, generate an example
                } else {
                    const itemExample = this.buildExampleHelper({
                        exampleId,
                        example: undefined,
                        schema: schema.value,
                        depth: depth + 1,
                        visitedSchemaIds,
                        options,
                        skipReadonly
                    });
                    if (itemExample != null) {
                        itemExamples.push(itemExample);
                    }
                }
                return FullExample.array(itemExamples);
            }
            case "map": {
                // use fullExample schema, with fallback to inlined example
                const objectExample = getFullExampleAsObject(example ?? schema.example);
                if (objectExample != null && Object.entries(objectExample).length > 0) {
                    const kvs: KeyValuePair[] = [];
                    for (const [key, value] of Object.entries(objectExample)) {
                        const keyExample = this.buildExampleFromPrimitive({
                            schema: schema.key.schema,
                            example: key,
                            options
                        });
                        const valueExample = this.buildExampleHelper({
                            exampleId,
                            example: value,
                            schema: schema.value,
                            visitedSchemaIds,
                            depth: depth + 1,
                            options,
                            skipReadonly
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
                // In this instance we have an unknown object, which becomes a map of string to unknown
                // we special case this to not create a nested map, but rather have a cleaner "Any Object" example
                // of: "object": {"key": "value"} as opposed to "object": {"object": {"key": "value"}}
                if (schema.key.schema.type === "string" && schema.value.type === "unknown") {
                    return FullExample.map([
                        {
                            key: PrimitiveExample.string("key"),
                            value: FullExample.unknown(FullExample.primitive(PrimitiveExample.string("value")))
                        }
                    ]);
                }
                const keyExample = this.buildExampleFromPrimitive({
                    schema: schema.key.schema,
                    example: undefined,
                    options: {
                        ...options,
                        // override the name to be "key" for map keys otherwise you can start to get key name
                        // nesting since primitive examples use their name e.g. "metadata": {"metadata": {...}}
                        name: "key"
                    }
                });
                const valueExample = this.buildExampleHelper({
                    exampleId,
                    example: undefined,
                    schema: schema.value,
                    visitedSchemaIds,
                    depth: depth + 1,
                    options: {
                        ...options,
                        // override the name to be "value" for map value otherwise you can start to get key name
                        // nesting since primitive examples use their name e.g. "metadata": {"metadata": "metadata"}
                        name: "value"
                    },
                    skipReadonly
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
                const foundObjectExample =
                    schema.fullExamples?.find((example) => example.name === exampleId) ??
                    schema.fullExamples?.find((example) => example.name == null) ??
                    schema.fullExamples?.[0];
                const fullExample =
                    getFullExampleAsObject(example) ??
                    (foundObjectExample != null ? getFullExampleAsObject(foundObjectExample.value) : {}) ??
                    {};
                const allProperties = this.getAllProperties(schema);
                const requiredProperties = this.getAllRequiredProperties(schema);
                for (const [property, schema] of Object.entries(allProperties)) {
                    if (skipReadonly && schema.readonly) {
                        continue;
                    }
                    const required = property in requiredProperties;
                    const inExample = Object.keys(fullExample).includes(property);

                    const propertyExample = this.buildExampleHelper({
                        schema: schema.schema,
                        exampleId,
                        example: fullExample[property],
                        visitedSchemaIds,
                        depth: depth + 1,
                        options: {
                            ...options,
                            name: property
                        },
                        skipReadonly
                    });
                    if (required && propertyExample != null) {
                        result[property] = propertyExample;
                    } else if (required) {
                        return undefined;
                    } else if (inExample && propertyExample != null) {
                        result[property] = propertyExample;
                    } else if (!options.ignoreOptionals && propertyExample != null) {
                        result[property] = propertyExample;
                    }
                }
                if (schema.additionalProperties) {
                    for (const [property, value] of Object.entries(fullExample)) {
                        if (!(property in result)) {
                            const propertyExample = this.buildExampleHelper({
                                schema: SchemaWithExample.unknown({
                                    example: value,
                                    title: undefined,
                                    availability: undefined,
                                    description: undefined,
                                    generatedName: "",
                                    nameOverride: undefined,
                                    groupName: undefined
                                }),
                                exampleId,
                                example: value,
                                visitedSchemaIds,
                                depth: depth + 1,
                                options: {
                                    ...options,
                                    name: property
                                },
                                skipReadonly
                            });
                            if (propertyExample != null) {
                                result[property] = propertyExample;
                            }
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

    private getObjectSchema(
        schema: FernOpenapiIr.SchemaWithExample
    ): FernOpenapiIr.ObjectSchemaWithExample | undefined {
        if (schema.type === "object") {
            return schema;
        }
        if (schema.type === "reference") {
            const referenceDeclaration = this.schemas[schema.schema];
            if (referenceDeclaration != null) {
                return this.getObjectSchema(referenceDeclaration);
            }
        }
        return undefined;
    }

    private getDiscriminatedUnionVariantSchema(
        schema: FernOpenapiIr.DiscriminatedOneOfSchemaWithExample,
        fullExample: Record<string, unknown> | undefined
    ): [string, SchemaWithExample] | undefined {
        const discriminantValue = fullExample?.[schema.discriminantProperty];
        if (discriminantValue == null || typeof discriminantValue !== "string") {
            return Object.entries(schema.schemas)[0];
        }

        const unionVariantSchema = schema.schemas[discriminantValue];
        if (unionVariantSchema == null) {
            return Object.entries(schema.schemas)[0];
        }

        return [discriminantValue, unionVariantSchema];
    }

    private getUnDiscriminatedUnionVariantSchema(
        schema: FernOpenapiIr.UnDiscriminatedOneOfSchemaWithExample,
        fullExample: unknown
    ): SchemaWithExample | undefined {
        if (fullExample == null) {
            return schema.schemas[0];
        }

        // rank schemas by how many properties they have in the example
        // if there are multiple schemas with the same number of properties, return the first one
        // downrank schemas where the example has properties that are not in the schema
        const matches = schema.schemas.map((schema) => ({
            schema,
            heuristic: this.calcExampleHeuristic(schema, fullExample)
        }));

        const sortedMatches = matches.sort((a, b) => b.heuristic - a.heuristic);

        return sortedMatches[0]?.schema;
    }

    // this is not a perfect heuristic, but it's a start. algorithm is as follows:
    // * tally up all properties that are both in the schema and example when traversing recursively
    // * subtract 1 for every property that is in the example but not in the schema.
    // this doesn't account for objects that can have arbitrary properties, and overvalues schemas with more properties.
    private calcExampleHeuristic(schema: SchemaWithExample, fullExample: unknown): number {
        switch (schema.type) {
            case "literal": {
                // if the example is the same as the literal, return a high score
                return schema.value.value === fullExample ? 5 : 0;
            }
            case "enum": {
                // if the example is in the enum, return a high score
                return enumContainsValue({ schema, value: fullExample as string }) ? 5 : 0;
            }
            case "object": {
                if (!isPlainObject(fullExample)) {
                    return 0;
                }
                const allProperties = this.getAllProperties(schema);
                let heuristic = 0;
                for (const [property, schema] of Object.entries(allProperties)) {
                    if (fullExample[property] != null) {
                        heuristic++;
                        heuristic += this.calcExampleHeuristic(schema.schema, fullExample[property]);
                    } else {
                        heuristic--;
                    }
                }

                return heuristic;
            }
            case "array": {
                if (!Array.isArray(fullExample)) {
                    return 0;
                }
                let heuristic = 0;
                for (const item of fullExample) {
                    heuristic += this.calcExampleHeuristic(schema.value, item);
                }
                return heuristic;
            }
            case "map": {
                if (!isPlainObject(fullExample)) {
                    return 0;
                }
                let heuristic = 0;
                for (const [, value] of Object.entries(fullExample)) {
                    heuristic += this.calcExampleHeuristic(schema.value, value);
                }
                return heuristic;
            }
            case "nullable":
            case "optional": {
                return this.calcExampleHeuristic(schema.value, fullExample);
            }
            case "reference": {
                const resolvedSchema = this.getResolvedSchema(schema);
                if (resolvedSchema == null) {
                    return 0;
                }
                return this.calcExampleHeuristic(resolvedSchema, fullExample);
            }
            case "oneOf": {
                const matches = Object.values(schema.value.schemas).map((schema) =>
                    this.calcExampleHeuristic(schema, fullExample)
                );
                return matches.sort((a, b) => b - a)[0] ?? 0;
            }
            case "primitive": {
                if (fullExample == null) {
                    return 0;
                }
                const matches = schema.schema._visit({
                    int: () => typeof fullExample === "number",
                    int64: () => typeof fullExample === "number",
                    uint: () => typeof fullExample === "number",
                    uint64: () => typeof fullExample === "number",
                    float: () => typeof fullExample === "number",
                    double: () => typeof fullExample === "number",
                    string: () => typeof fullExample === "string",
                    datetime: () => typeof fullExample === "string",
                    date: () => typeof fullExample === "string",
                    base64: () => typeof fullExample === "string",
                    boolean: () => typeof fullExample === "boolean",
                    _other: () => true
                });
                return matches ? 1 : -1;
            }
            default:
                return 0;
        }
    }

    private hasExample(
        schema: SchemaWithExample,
        depth: number,
        visitedSchemaIds: Set<SchemaId> = new Set(),
        options: ExampleTypeFactory.Options
    ): boolean {
        if (this.exceedsMaxCheckerDepth(depth, options)) {
            return false;
        }
        switch (schema.type) {
            case "array":
                return this.hasExample(schema.value, depth + 1, visitedSchemaIds, options);
            case "enum":
                return schema.example != null;
            case "literal":
                return false;
            case "map":
                return (
                    schema.example != null ||
                    (schema.key.schema.example != null &&
                        this.hasExample(schema.value, depth + 1, visitedSchemaIds, options))
                );
            case "object": {
                const objectExample = schema.fullExamples != null && schema.fullExamples.length > 0;
                if (objectExample) {
                    return true;
                }
                for (const property of schema.properties) {
                    if (this.hasExample(property.schema, depth + 1, visitedSchemaIds, options)) {
                        return true;
                    }
                }
                return false;
            }
            case "primitive":
                return schema.schema.example != null;
            case "reference": {
                const resolvedSchema = this.schemas[schema.schema];

                if (resolvedSchema != null && !visitedSchemaIds.has(schema.schema)) {
                    visitedSchemaIds.add(schema.schema);
                    const hasExample = this.hasExample(resolvedSchema, depth, visitedSchemaIds, options);
                    visitedSchemaIds.delete(schema.schema);
                    return hasExample;
                }

                return false;
            }
            case "unknown":
                return schema.example != null;
            case "oneOf":
                return Object.values(schema.value.schemas).some((schema) =>
                    this.hasExample(schema, depth, visitedSchemaIds, options)
                );
            default:
                return false;
        }
    }

    private exceedsMaxCheckerDepth(depth: number, options: ExampleTypeFactory.Options): boolean {
        return depth > (options.maxCheckerDepth ?? 0);
    }

    private exceedsMaxDepth(depth: number, options: ExampleTypeFactory.Options): boolean {
        return depth > (options.maxDepth ?? 0);
    }

    private getAllProperties(
        object: ObjectSchemaWithExample
    ): Record<string, { schema: SchemaWithExample; readonly: boolean }> {
        let properties: Record<string, { schema: SchemaWithExample; readonly: boolean }> = {};
        for (const property of object.properties) {
            properties[property.key] = { schema: property.schema, readonly: property.readonly ?? false };
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
                    return PrimitiveExample.string(options.name ?? Examples.STRING);
                }
            case "base64":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.base64(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.base64(schema.example);
                } else {
                    return PrimitiveExample.base64(Examples.BASE64);
                }
            case "boolean":
                if (example != null && typeof example === "boolean") {
                    return PrimitiveExample.boolean(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.boolean(schema.example);
                } else {
                    return PrimitiveExample.boolean(Examples.BOOLEAN);
                }
            case "date":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.date(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.date(schema.example);
                } else {
                    return PrimitiveExample.date(Examples.DATE);
                }
            case "datetime":
                if (example != null && typeof example === "string") {
                    return PrimitiveExample.datetime(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.datetime(schema.example);
                } else {
                    return PrimitiveExample.datetime(Examples.DATE_TIME);
                }
            case "double":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.double(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.double(schema.example);
                } else {
                    return PrimitiveExample.double(Examples.DOUBLE);
                }
            case "float":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.float(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.float(schema.example);
                } else {
                    return PrimitiveExample.float(Examples.FLOAT);
                }
            case "int":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.int(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.int(schema.example);
                } else {
                    return PrimitiveExample.int(Examples.INT);
                }
            case "int64":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.int64(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.int64(schema.example);
                } else {
                    return PrimitiveExample.int64(Examples.INT64);
                }
            case "uint":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.uint(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.uint(schema.example);
                } else {
                    return PrimitiveExample.uint(Examples.UINT);
                }
            case "uint64":
                if (example != null && typeof example === "number") {
                    return PrimitiveExample.uint64(example);
                } else if (schema.example != null) {
                    return PrimitiveExample.uint64(schema.example);
                } else {
                    return PrimitiveExample.uint64(Examples.UINT64);
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
