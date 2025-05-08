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

    public convert(): ExampleConverter.Output {
        if (this.depth > this.MAX_DEPTH) {
            return { isValid: true, coerced: false, validExample: this.example, errors: [] };
        }
        const resolvedSchema = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
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
            return this.convertBoolean();
        }

        if (resolvedSchema.enum != null) {
            return this.convertEnum(resolvedSchema);
        }

        if (resolvedSchema.type == "number") {
            return this.convertNumber();
        }

        if (resolvedSchema.type == "string") {
            return this.convertString();
        }

        if (resolvedSchema.type == "integer") {
            return this.convertInteger();
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

    private convertBoolean(): ExampleConverter.Output {
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
            ? this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                  schemaOrReference: this.schema,
                  breadcrumbs: this.breadcrumbs
              })?.default
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
            validExample: this.maybeResolveSchemaExample<boolean>(this.schema) ?? this.EXAMPLE_BOOLEAN,
            errors: [
                {
                    message: `Example is not a boolean: ${JSON.stringify(this.example, null, 2)}`,
                    path: this.breadcrumbs
                }
            ]
        };
    }

    private convertEnum(resolvedSchema: OpenAPIV3_1.SchemaObject): ExampleConverter.Output {
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
            ? this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                  schemaOrReference: this.schema,
                  breadcrumbs: this.breadcrumbs
              })?.default
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

    private convertNumber(): ExampleConverter.Output {
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
            ? this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                  schemaOrReference: this.schema,
                  breadcrumbs: this.breadcrumbs
              })?.default
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
            validExample: this.maybeResolveSchemaExample<number>(this.schema) ?? this.EXAMPLE_NUMBER,
            errors: [
                {
                    message: `Example is not a number: ${JSON.stringify(this.example, null, 2)}`,
                    path: this.breadcrumbs
                }
            ]
        };
    }

    private convertString(): ExampleConverter.Output {
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
            ? this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                  schemaOrReference: this.schema,
                  breadcrumbs: this.breadcrumbs
              })?.default
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
            validExample: this.maybeResolveSchemaExample<string>(this.schema) ?? this.EXAMPLE_STRING,
            errors: [
                {
                    message: `Example cannot be converted to string: ${JSON.stringify(this.example, null, 2)}`,
                    path: this.breadcrumbs
                }
            ]
        };
    }

    private convertInteger(): ExampleConverter.Output {
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
            ? this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                  schemaOrReference: this.schema,
                  breadcrumbs: this.breadcrumbs
              })?.default
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
            validExample: this.maybeResolveSchemaExample<number>(this.schema) ?? this.EXAMPLE_INTEGER,
            errors: [
                {
                    message: `Example is not an integer: ${JSON.stringify(this.example, null, 2)}`,
                    path: this.breadcrumbs
                }
            ]
        };
    }

    private convertArray({ resolvedSchema }: { resolvedSchema: OpenAPIV3_1.SchemaObject }): ExampleConverter.Output {
        if (resolvedSchema.type != "array") {
            return { isValid: false, coerced: false, validExample: null, errors: [] };
        }
        if (resolvedSchema.items == null) {
            resolvedSchema.items = { type: "string" };
        }
        const exampleArray = Array.isArray(this.example) ? this.example : [this.example];
        const results = exampleArray.map((item, index) => {
            const exampleConverter = new ExampleConverter({
                breadcrumbs: [...this.breadcrumbs, `Item[${index}]`],
                context: this.context,
                schema: resolvedSchema.items,
                example: item,
                depth: this.depth + 1,
                generateOptionalProperties: this.generateOptionalProperties,
                exampleGenerationStrategy: this.exampleGenerationStrategy
            });
            return exampleConverter.convert();
        });

        const isValid = results.every((result) => result?.isValid ?? false);

        return {
            isValid,
            coerced: false,
            validExample: results.map((result) => result.validExample),
            errors: isValid ? [] : results.flatMap((result) => result.errors)
        };
    }

    private convertObject({ resolvedSchema }: { resolvedSchema: OpenAPIV3_1.SchemaObject }): ExampleConverter.Output {
        if (resolvedSchema.type == "object" && resolvedSchema.properties == null && resolvedSchema.allOf == null) {
            return { isValid: true, coerced: false, validExample: this.example ?? {}, errors: [] };
        }

        const exampleObj =
            typeof this.example !== "object" || this.example == null ? {} : (this.example as Record<string, unknown>);

        const resultsByKey = Object.entries(resolvedSchema.properties ?? {}).map(([key, property]) => {
            if (typeof property !== "object") {
                return { key, result: { isValid: true, coerced: false, validExample: undefined, errors: [] } };
            }
            if (
                "readOnly" in property &&
                property.readOnly === true &&
                "writeOnly" in property &&
                property.writeOnly === true
            ) {
                return { key, result: { isValid: true, coerced: false, validExample: undefined, errors: [] } };
            }
            // TODO: Do we want to collect an error when the request / response example does not respect the readOnly / writeOnly property?
            if ("readOnly" in property && property.readOnly === true && this.exampleGenerationStrategy === "request") {
                return { key, result: { isValid: true, coerced: false, validExample: undefined, errors: [] } };
            }
            if (
                "writeOnly" in property &&
                property.writeOnly === true &&
                this.exampleGenerationStrategy === "response"
            ) {
                return { key, result: { isValid: true, coerced: false, validExample: undefined, errors: [] } };
            }
            const propertyIsOmittedFromExample =
                !(key in exampleObj) ||
                (!("nullable" in property) && exampleObj[key] == null) ||
                ("nullable" in property && property.nullable === true && exampleObj[key] === undefined);
            const propertyIsOptional = !resolvedSchema.required?.includes(key);

            if (propertyIsOmittedFromExample && propertyIsOptional) {
                if (this.example === undefined && this.generateOptionalProperties) {
                    const exampleConverter = new ExampleConverter({
                        breadcrumbs: [...this.breadcrumbs, key],
                        context: this.context,
                        schema: property,
                        example: undefined,
                        depth: this.depth + 1,
                        generateOptionalProperties: this.generateOptionalProperties,
                        exampleGenerationStrategy: this.exampleGenerationStrategy
                    });
                    return { key, result: exampleConverter.convert() };
                }
                return { key, result: { isValid: true, coerced: false, validExample: undefined, errors: [] } };
            } else {
                const exampleConverter = new ExampleConverter({
                    breadcrumbs: [...this.breadcrumbs, key],
                    context: this.context,
                    schema: property,
                    example: exampleObj[key],
                    depth: this.depth + 1,
                    generateOptionalProperties: this.generateOptionalProperties,
                    exampleGenerationStrategy: this.exampleGenerationStrategy
                });
                const result = exampleConverter.convert();
                return { key, result };
            }
        });

        const allOfResults = (resolvedSchema.allOf ?? []).map((subSchema, index) => {
            const exampleConverter = new ExampleConverter({
                breadcrumbs: [...this.breadcrumbs, `allOf[${index}]`],
                context: this.context,
                schema: { ...resolvedSchema, ...subSchema, allOf: undefined },
                example: this.example,
                depth: this.depth + 1,
                generateOptionalProperties: this.generateOptionalProperties,
                exampleGenerationStrategy: this.exampleGenerationStrategy
            });
            return exampleConverter.convert();
        });

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

    private convertSchemaTypeArray({
        resolvedSchema
    }: {
        resolvedSchema: OpenAPIV3_1.SchemaObject;
    }): ExampleConverter.Output {
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
            return exampleConverter.convert();
        }
        const results = resolvedSchema.type.map((subSchema, index) => {
            const exampleConverter = new ExampleConverter({
                breadcrumbs: [...this.breadcrumbs, `type[${index}]`],
                context: this.context,
                schema: { ...resolvedSchema, type: subSchema } as OpenAPIV3_1.SchemaObject,
                example: this.example,
                depth: this.depth + 1,
                generateOptionalProperties: this.generateOptionalProperties,
                exampleGenerationStrategy: this.exampleGenerationStrategy
            });
            return exampleConverter.convert();
        });

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

    private convertOneOf({ resolvedSchema }: { resolvedSchema: OpenAPIV3_1.SchemaObject }): ExampleConverter.Output {
        if (!("oneOf" in resolvedSchema) || resolvedSchema.oneOf == null) {
            return { isValid: false, coerced: false, validExample: null, errors: [] };
        }
        const results = resolvedSchema.oneOf.map((subSchema, index) => {
            const exampleConverter = new ExampleConverter({
                breadcrumbs: [...this.breadcrumbs, `oneOf[${index}]`],
                context: this.context,
                schema: { ...resolvedSchema, ...subSchema, oneOf: undefined },
                example: this.example,
                depth: this.depth + 1,
                generateOptionalProperties: this.generateOptionalProperties,
                exampleGenerationStrategy: this.exampleGenerationStrategy
            });
            return exampleConverter.convert();
        });

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

    private convertAnyOf({ resolvedSchema }: { resolvedSchema: OpenAPIV3_1.SchemaObject }): ExampleConverter.Output {
        if (!("anyOf" in resolvedSchema) || resolvedSchema.anyOf == null) {
            return { isValid: false, coerced: false, validExample: null, errors: [] };
        }
        const results = resolvedSchema.anyOf.map((subSchema, index) => {
            const exampleConverter = new ExampleConverter({
                breadcrumbs: [...this.breadcrumbs, `anyOf[${index}]`],
                context: this.context,
                schema: subSchema,
                example: this.example,
                depth: this.depth + 1,
                generateOptionalProperties: this.generateOptionalProperties,
                exampleGenerationStrategy: this.exampleGenerationStrategy
            });
            return exampleConverter.convert();
        });

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

    private maybeResolveSchemaExample<Type>(
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
    ): Type | undefined {
        const resolvedSchema = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
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
}
