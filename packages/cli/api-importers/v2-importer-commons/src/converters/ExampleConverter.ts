import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext, type OpenApiError } from "..";

export declare namespace ExampleConverter {
    export interface Args extends AbstractConverter.Args<AbstractConverterContext<object>> {
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        example: unknown;
        depth?: number;
        exampleGenerationStrategy?: "request" | "response";
        generateOptionalProperties?: boolean;
    }

    export interface Output {
        isValid: boolean;
        /**
         * Whether the example was coerced to the schema type.
         *
         * For oneOf and anyOf, we will aim to return a non-coerced valid example if possible,
         * then fall back to the first valid example otherwise. For instance:
         *
         * ```
         * oneOf:
         *   - type: string
         *   - type: number
         * ```
         *
         * example: 42
         *
         * will return, for each branch:
         *
         * ```
         * {
         *   isValid: true,
         *   coerced: true,  // coerced to string
         *   validExample: "42",
         *   errors: []
         * }, {
         *   isValid: true,
         *   coerced: false,  // not coerced
         *   validExample: 42,
         *   errors: []
         * }
         * ```
         *
         * In this case, the oneOf node will thus return the non-coerced example,
         * treating the example as a number.
         */
        coerced: boolean;
        validExample: unknown;
        /**
         * The errors that occurred during conversion.
         *
         * We can't collect errors along the way because for oneOf and anyOf, we don't know
         * which branch will be valid until we have converted all of them.
         */
        errors: OpenApiError[];
    }
}

export class ExampleConverter extends AbstractConverter<AbstractConverterContext<object>, ExampleConverter.Output> {
    protected readonly MAX_DEPTH = 12;
    protected readonly EXAMPLE_STRING = "foo";
    protected readonly EXAMPLE_NUMBER = 42.0;
    protected readonly EXAMPLE_BOOLEAN = true;
    protected readonly EXAMPLE_INTEGER = 42;

    private readonly schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    private readonly example: unknown;
    private readonly depth: number;
    private readonly exampleGenerationStrategy: "request" | "response" | undefined;
    private readonly generateOptionalProperties: boolean;

    constructor({
        breadcrumbs,
        context,
        schema,
        example,
        depth = 0,
        exampleGenerationStrategy,
        generateOptionalProperties = false
    }: ExampleConverter.Args) {
        super({ breadcrumbs, context });
        this.example = example;
        this.schema = schema;
        this.depth = depth;
        this.exampleGenerationStrategy = exampleGenerationStrategy;
        this.generateOptionalProperties = generateOptionalProperties;
    }

    public async convert(): Promise<ExampleConverter.Output> {
        if (this.depth > this.MAX_DEPTH) {
            return { isValid: true, coerced: false, validExample: this.example, errors: [] };
        }
        const resolvedSchema = await this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
            schemaOrReference: this.schema,
            breadcrumbs: this.breadcrumbs
        });
        if (resolvedSchema == null) {
            return {
                isValid: false,
                coerced: false,
                validExample: null,
                errors: [
                    {
                        message: "Schema is not resolvable",
                        path: this.breadcrumbs
                    }
                ]
            };
        }
        if (typeof resolvedSchema !== "object") {
            return {
                isValid: false,
                coerced: false,
                validExample: null,
                errors: [
                    {
                        message: `Schema should be an object: ${JSON.stringify(resolvedSchema, null, 2)}`,
                        path: this.breadcrumbs
                    }
                ]
            };
        }
        if ("nullable" in resolvedSchema && resolvedSchema.nullable === true && this.example === null) {
            return {
                isValid: true,
                coerced: false,
                validExample: this.example,
                errors: []
            };
        }

        if (Array.isArray(resolvedSchema.type)) {
            return this.convertSchemaTypeArray({
                resolvedSchema
            });
        }

        if (resolvedSchema.type == "null") {
            return this.convertNull();
        }

        if (resolvedSchema.type == "boolean") {
            return await this.convertBoolean();
        }

        if (resolvedSchema.enum != null) {
            return this.convertEnum(resolvedSchema);
        }

        if (resolvedSchema.type == "number") {
            return await this.convertNumber();
        }

        if (resolvedSchema.type == "string") {
            return await this.convertString();
        }

        if (resolvedSchema.type == "integer") {
            return await this.convertInteger();
        }

        if (resolvedSchema.type == "array") {
            return this.convertArray({
                resolvedSchema
            });
        }

        if ("oneOf" in resolvedSchema && resolvedSchema.oneOf != null) {
            return this.convertOneOf({
                resolvedSchema
            });
        }

        if ("anyOf" in resolvedSchema && resolvedSchema.anyOf != null) {
            return this.convertAnyOf({
                resolvedSchema
            });
        }

        if (resolvedSchema.type == "object" || resolvedSchema.properties != null || resolvedSchema.allOf != null) {
            return this.convertObject({
                resolvedSchema
            });
        }

        if (typeof resolvedSchema === "object" && Object.keys(resolvedSchema).length === 0) {
            return {
                isValid: true,
                coerced: false,
                validExample: this.example,
                errors: []
            };
        }

        return {
            isValid: false,
            coerced: false,
            validExample: null,
            errors: [
                {
                    message: `Unsupported schema type: ${JSON.stringify(resolvedSchema, null, 2)}`,
                    path: this.breadcrumbs
                }
            ]
        };
    }

    private convertNull(): ExampleConverter.Output {
        const isValid = this.example === null;
        return isValid
            ? {
                  isValid,
                  coerced: false,
                  validExample: this.example,
                  errors: []
              }
            : {
                  isValid: false,
                  coerced: false,
                  validExample: null,
                  errors: [
                      {
                          message: `Example is not null: ${JSON.stringify(this.example, null, 2)}`,
                          path: this.breadcrumbs
                      }
                  ]
              };
    }

    private async convertBoolean(): Promise<ExampleConverter.Output> {
        const isValid = typeof this.example === "boolean";
        if (isValid) {
            return {
                isValid,
                coerced: false,
                validExample: this.example,
                errors: []
            };
        }

        const resolvedDefault = this.context.isReferenceObject(this.schema)
            ? (
                  await this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                      schemaOrReference: this.schema,
                      breadcrumbs: this.breadcrumbs
                  })
              )?.default
            : this.schema.default;

        if (typeof resolvedDefault === "boolean") {
            return {
                isValid: true,
                coerced: false,
                validExample: resolvedDefault,
                errors: []
            };
        }

        return {
            isValid: false,
            coerced: false,
            validExample: (await this.maybeResolveSchemaExample<boolean>(this.schema)) ?? this.EXAMPLE_BOOLEAN,
            errors: [
                {
                    message: `Example is not a boolean: ${JSON.stringify(this.example, null, 2)}`,
                    path: this.breadcrumbs
                }
            ]
        };
    }

    private async convertEnum(resolvedSchema: OpenAPIV3_1.SchemaObject): Promise<ExampleConverter.Output> {
        const isValid = resolvedSchema.enum?.includes(this.example) ?? false;
        if (isValid) {
            return {
                isValid,
                coerced: false,
                validExample: this.example,
                errors: []
            };
        }

        const resolvedDefault = this.context.isReferenceObject(this.schema)
            ? (
                  await this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                      schemaOrReference: this.schema,
                      breadcrumbs: this.breadcrumbs
                  })
              )?.default
            : this.schema.default;

        if (resolvedDefault !== undefined && resolvedSchema.enum?.includes(resolvedDefault)) {
            return {
                isValid: true,
                coerced: false,
                validExample: resolvedDefault,
                errors: []
            };
        }

        return {
            isValid,
            coerced: false,
            validExample: resolvedSchema.enum?.[0],
            errors: [
                {
                    message: `Example is not one of the allowed enum values: ${JSON.stringify(resolvedSchema.enum, null, 2)}`,
                    path: this.breadcrumbs
                }
            ]
        };
    }

    private async convertNumber(): Promise<ExampleConverter.Output> {
        if (typeof this.example === "number") {
            return {
                isValid: true,
                coerced: false,
                validExample: this.example,
                errors: []
            };
        }

        const num = Number(this.example);
        if (!isNaN(num)) {
            return {
                isValid: true,
                coerced: true,
                validExample: num,
                errors: []
            };
        }

        const resolvedDefault = this.context.isReferenceObject(this.schema)
            ? (
                  await this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                      schemaOrReference: this.schema,
                      breadcrumbs: this.breadcrumbs
                  })
              )?.default
            : this.schema.default;
        if (typeof resolvedDefault === "number") {
            return {
                isValid: true,
                coerced: false,
                validExample: resolvedDefault,
                errors: []
            };
        }

        return {
            isValid: false,
            coerced: false,
            validExample: (await this.maybeResolveSchemaExample<number>(this.schema)) ?? this.EXAMPLE_NUMBER,
            errors: [
                {
                    message: `Example is not a number: ${JSON.stringify(this.example, null, 2)}`,
                    path: this.breadcrumbs
                }
            ]
        };
    }

    private async convertString(): Promise<ExampleConverter.Output> {
        if (typeof this.example === "string") {
            return {
                isValid: true,
                coerced: false,
                validExample: this.example,
                errors: []
            };
        }

        if (typeof this.example !== "object" && !Array.isArray(this.example) && this.example != null) {
            const stringValue = String(this.example);
            return {
                isValid: true,
                coerced: true,
                validExample: stringValue,
                errors: []
            };
        }

        const resolvedDefault = this.context.isReferenceObject(this.schema)
            ? (
                  await this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                      schemaOrReference: this.schema,
                      breadcrumbs: this.breadcrumbs
                  })
              )?.default
            : this.schema.default;

        if (typeof resolvedDefault === "string") {
            return {
                isValid: true,
                coerced: false,
                validExample: resolvedDefault,
                errors: []
            };
        }

        return {
            isValid: false,
            coerced: false,
            validExample: (await this.maybeResolveSchemaExample<string>(this.schema)) ?? this.EXAMPLE_STRING,
            errors: [
                {
                    message: `Example cannot be converted to string: ${JSON.stringify(this.example, null, 2)}`,
                    path: this.breadcrumbs
                }
            ]
        };
    }

    private async convertInteger(): Promise<ExampleConverter.Output> {
        if (typeof this.example === "number" && Number.isInteger(this.example)) {
            return {
                isValid: true,
                coerced: false,
                validExample: this.example,
                errors: []
            };
        }

        if (typeof this.example === "string") {
            const num = Number(this.example);
            if (!isNaN(num) && Number.isInteger(num)) {
                return {
                    isValid: true,
                    coerced: true,
                    validExample: num,
                    errors: []
                };
            }
        }

        const resolvedDefault = this.context.isReferenceObject(this.schema)
            ? (
                  await this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                      schemaOrReference: this.schema,
                      breadcrumbs: this.breadcrumbs
                  })
              )?.default
            : this.schema.default;
        if (typeof resolvedDefault === "number" && Number.isInteger(resolvedDefault)) {
            return {
                isValid: true,
                coerced: false,
                validExample: resolvedDefault,
                errors: []
            };
        }

        return {
            isValid: false,
            coerced: false,
            validExample: (await this.maybeResolveSchemaExample<number>(this.schema)) ?? this.EXAMPLE_INTEGER,
            errors: [
                {
                    message: `Example is not an integer: ${JSON.stringify(this.example, null, 2)}`,
                    path: this.breadcrumbs
                }
            ]
        };
    }

    private async convertArray({
        resolvedSchema
    }: {
        resolvedSchema: OpenAPIV3_1.SchemaObject;
    }): Promise<ExampleConverter.Output> {
        if (resolvedSchema.type != "array") {
            return { isValid: false, coerced: false, validExample: null, errors: [] };
        }
        if (resolvedSchema.items == null) {
            resolvedSchema.items = { type: "string" };
        }
        const exampleArray = Array.isArray(this.example) ? this.example : [this.example];
        const results = await Promise.all(
            exampleArray.map(async (item, index) => {
                const exampleConverter = new ExampleConverter({
                    breadcrumbs: [...this.breadcrumbs, `Item[${index}]`],
                    context: this.context,
                    schema: resolvedSchema.items,
                    example: item,
                    depth: this.depth + 1,
                    generateOptionalProperties: this.generateOptionalProperties,
                    exampleGenerationStrategy: this.exampleGenerationStrategy
                });
                return await exampleConverter.convert();
            })
        );

        const isValid = results.every((result) => result?.isValid ?? false);

        return {
            isValid,
            coerced: false,
            validExample: results.map((result) => result.validExample),
            errors: isValid ? [] : results.flatMap((result) => result.errors)
        };
    }

    private async convertObject({
        resolvedSchema
    }: {
        resolvedSchema: OpenAPIV3_1.SchemaObject;
    }): Promise<ExampleConverter.Output> {
        if (resolvedSchema.type == "object" && resolvedSchema.properties == null && resolvedSchema.allOf == null) {
            return { isValid: true, coerced: false, validExample: this.example ?? {}, errors: [] };
        }

        const exampleObject =
            typeof this.example !== "object" || this.example == null ? {} : (this.example as Record<string, unknown>);

        const resultsByKey = await Promise.all(
            Object.entries(resolvedSchema.properties ?? {}).map(async ([key, property]) =>
                this.getExampleForProperty({
                    key,
                    property,
                    exampleObject,
                    isRequiredProperty: this.isRequiredProperty({ key, resolvedSchema })
                })
            )
        );

        const allOfResults = await Promise.all(
            (resolvedSchema.allOf ?? []).map(async (subSchema, index) => {
                const exampleConverter = new ExampleConverter({
                    breadcrumbs: [...this.breadcrumbs, `allOf[${index}]`],
                    context: this.context,
                    schema: { ...resolvedSchema, ...subSchema, allOf: undefined },
                    example: this.example,
                    depth: this.depth + 1,
                    generateOptionalProperties: this.generateOptionalProperties,
                    exampleGenerationStrategy: this.exampleGenerationStrategy
                });
                return await exampleConverter.convert();
            })
        );

        const isValid =
            resultsByKey.every((entry) => entry.result.isValid) && allOfResults.every((result) => result.isValid);

        let example = Object.fromEntries(
            resultsByKey
                .map(({ key, result }) => [key, result.validExample])
                .filter(([_, value]) => value !== undefined)
        );

        for (const result of allOfResults) {
            if (typeof result.validExample === "object" && result.validExample !== null) {
                const validExampleObj = result.validExample as Record<string, unknown>;
                example = {
                    ...example,
                    ...Object.fromEntries(Object.entries(validExampleObj).filter(([_, value]) => value !== undefined))
                };
            }
        }

        if (Object.keys(example).length === 0) {
            const firstValidNonObject = allOfResults.find(
                (result) =>
                    result.validExample !== undefined &&
                    (typeof result.validExample !== "object" || result.validExample === null)
            );
            if (firstValidNonObject) {
                example = firstValidNonObject.validExample;
            }
        }

        return {
            isValid,
            coerced: false,
            validExample: example,
            errors: [
                ...resultsByKey.flatMap(({ result }) => result.errors),
                ...allOfResults.flatMap((result) => result.errors)
            ]
        };
    }

    private async convertSchemaTypeArray({
        resolvedSchema
    }: {
        resolvedSchema: OpenAPIV3_1.SchemaObject;
    }): Promise<ExampleConverter.Output> {
        if (!Array.isArray(resolvedSchema.type)) {
            return { isValid: false, coerced: false, validExample: null, errors: [] };
        }
        if (resolvedSchema.type.length === 1) {
            const exampleConverter = new ExampleConverter({
                breadcrumbs: this.breadcrumbs,
                context: this.context,
                schema: { ...resolvedSchema, type: resolvedSchema.type[0] } as OpenAPIV3_1.SchemaObject,
                example: this.example,
                depth: this.depth,
                generateOptionalProperties: this.generateOptionalProperties,
                exampleGenerationStrategy: this.exampleGenerationStrategy
            });
            return await exampleConverter.convert();
        }
        const results = await Promise.all(
            resolvedSchema.type.map(async (subSchema, index) => {
                const exampleConverter = new ExampleConverter({
                    breadcrumbs: [...this.breadcrumbs, `type[${index}]`],
                    context: this.context,
                    schema: { ...resolvedSchema, type: subSchema } as OpenAPIV3_1.SchemaObject,
                    example: this.example,
                    depth: this.depth + 1,
                    generateOptionalProperties: this.generateOptionalProperties,
                    exampleGenerationStrategy: this.exampleGenerationStrategy
                });
                return await exampleConverter.convert();
            })
        );

        const isValid = results.some((result) => result?.isValid ?? false);

        const validExample = results.find((result) => result.isValid)?.validExample;
        const example = validExample ?? results[0]?.validExample ?? null;

        return {
            isValid,
            coerced: false,
            validExample: example,
            errors: isValid ? [] : results.flatMap((result) => result?.errors ?? [])
        };
    }

    private async convertOneOf({
        resolvedSchema
    }: {
        resolvedSchema: OpenAPIV3_1.SchemaObject;
    }): Promise<ExampleConverter.Output> {
        if (!("oneOf" in resolvedSchema) || resolvedSchema.oneOf == null) {
            return { isValid: false, coerced: false, validExample: null, errors: [] };
        }
        const results = await Promise.all(
            resolvedSchema.oneOf.map(async (subSchema, index) => {
                const exampleConverter = new ExampleConverter({
                    breadcrumbs: [...this.breadcrumbs, `oneOf[${index}]`],
                    context: this.context,
                    schema: { ...resolvedSchema, ...subSchema, oneOf: undefined },
                    example: this.example,
                    depth: this.depth + 1,
                    generateOptionalProperties: this.generateOptionalProperties,
                    exampleGenerationStrategy: this.exampleGenerationStrategy
                });
                return await exampleConverter.convert();
            })
        );

        const validResults = results.filter((result) => result.isValid);
        const isValid = validResults.length > 0;

        let validExample;
        if (isValid) {
            const nonCoercedResult = validResults.find((result) => !result.coerced);
            validExample = nonCoercedResult?.validExample ?? validResults[0]?.validExample;
        } else {
            validExample = results[0]?.validExample;
        }

        return {
            isValid,
            coerced: false,
            validExample,
            errors: isValid ? [] : results.flatMap((result) => result.errors)
        };
    }

    private async convertAnyOf({
        resolvedSchema
    }: {
        resolvedSchema: OpenAPIV3_1.SchemaObject;
    }): Promise<ExampleConverter.Output> {
        if (!("anyOf" in resolvedSchema) || resolvedSchema.anyOf == null) {
            return { isValid: false, coerced: false, validExample: null, errors: [] };
        }
        const results = await Promise.all(
            resolvedSchema.anyOf.map(async (subSchema, index) => {
                const exampleConverter = new ExampleConverter({
                    breadcrumbs: [...this.breadcrumbs, `anyOf[${index}]`],
                    context: this.context,
                    schema: subSchema,
                    example: this.example,
                    depth: this.depth + 1,
                    generateOptionalProperties: this.generateOptionalProperties,
                    exampleGenerationStrategy: this.exampleGenerationStrategy
                });
                return await exampleConverter.convert();
            })
        );

        const validResults = results.filter((result) => result.isValid);
        const isValid = validResults.length > 0;

        let validExample;
        if (isValid) {
            const nonCoercedResult = validResults.find((result) => !result.coerced);
            validExample = nonCoercedResult?.validExample ?? validResults[0]?.validExample;
        } else {
            validExample = results[0]?.validExample;
        }

        return {
            isValid,
            coerced: false,
            validExample,
            errors: isValid ? [] : results.flatMap((result) => result.errors)
        };
    }

    private async maybeResolveSchemaExample<Type>(
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
    ): Promise<Type | undefined> {
        const resolvedSchema = await this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
            schemaOrReference: schema,
            breadcrumbs: this.breadcrumbs
        });
        if (resolvedSchema == null) {
            return undefined;
        }
        if ("example" in resolvedSchema) {
            return resolvedSchema.example as Type;
        }
        if ("examples" in resolvedSchema) {
            return Object.values(resolvedSchema.examples ?? {})[0] as Type;
        }
        return undefined;
    }

    // Checks if there is an example property and that the example property is not null
    private hasValidExampleProperty(
        property: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
    ): property is OpenAPIV3_1.SchemaObject & { example: unknown } {
        return property != null && "example" in property && property.example != null;
    }

    private isRequiredProperty({
        key,
        resolvedSchema
    }: {
        key: string;
        resolvedSchema: OpenAPIV3_1.SchemaObject;
    }): boolean {
        return resolvedSchema.required?.includes(key) ?? false;
    }

    private shouldSkipExampleGeneration({
        property,
        isRequiredProperty,
        propertyIsDefinedInExampleObject
    }: {
        property: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        isRequiredProperty: boolean;
        propertyIsDefinedInExampleObject: boolean;
    }): boolean {
        // Handle read-only and write-only scenarios
        const isReadOnly = "readOnly" in property && property.readOnly === true;
        const isWriteOnly = "writeOnly" in property && property.writeOnly === true;

        if (isReadOnly && isWriteOnly) {
            return true;
        }

        // TODO: Do we want to collect an error when the request / response example does not respect the readOnly / writeOnly property?
        if (isReadOnly && this.exampleGenerationStrategy === "request") {
            return true;
        }

        if (isWriteOnly && this.exampleGenerationStrategy === "response") {
            return true;
        }

        // If the property is not in the example object and is optional, skip example generation
        if (!propertyIsDefinedInExampleObject && !isRequiredProperty) {
            return true;
        }

        return false;
    }

    private async getExampleForProperty({
        key,
        property,
        exampleObject,
        isRequiredProperty
    }: {
        key: string;
        property: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        exampleObject: Record<string, unknown>;
        isRequiredProperty: boolean;
    }) {
        // The ExampleConverter.Args are the same in each scenario (aside
        // from the example), so we can use the same context for each.
        const exampleContext: Omit<ExampleConverter.Args, "example"> = {
            breadcrumbs: [...this.breadcrumbs, key],
            context: this.context,
            schema: property,
            depth: this.depth + 1,
            generateOptionalProperties: this.generateOptionalProperties
        };

        const propertyIsDefinedInExampleObject = exampleObject && key in exampleObject && exampleObject[key] != null;

        if (this.shouldSkipExampleGeneration({ property, isRequiredProperty, propertyIsDefinedInExampleObject })) {
            return { key, result: { isValid: true, coerced: false, validExample: undefined, errors: [] } };
        }

        // If this.example is defined, and the property is not included in this.example, and
        // the property is required or optional, generate an example
        if (
            exampleObject &&
            !propertyIsDefinedInExampleObject &&
            (isRequiredProperty || this.generateOptionalProperties)
        ) {
            const exampleConverter = new ExampleConverter({
                ...exampleContext,
                example: undefined
            });

            const result = await exampleConverter.convert();

            return { key, result };
        }

        // If the property is included in this.example, validate the example and return
        if (propertyIsDefinedInExampleObject) {
            const exampleConverter = new ExampleConverter({
                ...exampleContext,
                example: exampleObject[key]
            });

            const result = await exampleConverter.convert();

            return { key, result };
        }

        // If the property is not in this.example, but does have an example, validate property.example and return
        const propertyHasInlineExample = this.hasValidExampleProperty(property);
        if (propertyHasInlineExample) {
            const exampleConverter = new ExampleConverter({
                ...exampleContext,
                example: property.example
            });

            const result = await exampleConverter.convert();

            return { key, result };
        }

        // As a fallback, return an empty example
        return { key, result: { isValid: true, coerced: false, validExample: undefined, errors: [] } };
    }
}
