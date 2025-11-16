import { Examples } from "@fern-api/core-utils";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext, APIError } from "..";

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
        /**
         * Whether the converter used a provided example (this.example was not undefined)
         * to produce the validExample, as opposed to generating a fallback example.
         *
         * This is used by union converters to prefer variants that can use the provided
         * example over variants that require generating a fallback.
         */
        usedProvidedExample: boolean;
        validExample: unknown;
        /**
         * The errors that occurred during conversion.
         *
         * We can't collect errors along the way because for oneOf and anyOf, we don't know
         * which branch will be valid until we have converted all of them.
         */
        errors: APIError[];
    }
}

export class ExampleConverter extends AbstractConverter<AbstractConverterContext<object>, ExampleConverter.Output> {
    protected readonly MAX_DEPTH = 12;
    protected readonly EXAMPLE_STRING = Examples.STRING;
    protected readonly EXAMPLE_NUMBER = Examples.DOUBLE;
    protected readonly EXAMPLE_BOOLEAN = Examples.BOOLEAN;
    protected readonly EXAMPLE_INTEGER = Examples.INT;
    protected readonly EXAMPLE_DATE = Examples.DATE;
    protected readonly EXAMPLE_DATE_TIME = Examples.DATE_TIME;

    private readonly schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    private readonly example: unknown;
    private readonly depth: number;
    private readonly exampleGenerationStrategy: "request" | "response" | undefined;
    private readonly generateOptionalProperties: boolean;
    private readonly seenRefs: Set<string>;

    constructor({
        breadcrumbs,
        context,
        schema,
        example,
        depth = 0,
        exampleGenerationStrategy,
        generateOptionalProperties = false,
        seenRefs = new Set<string>()
    }: ExampleConverter.Args & { seenRefs?: Set<string> }) {
        super({ breadcrumbs, context });
        this.example = example;
        this.schema = schema;
        this.depth = depth;
        this.exampleGenerationStrategy = exampleGenerationStrategy;
        this.generateOptionalProperties = generateOptionalProperties;
        this.seenRefs = seenRefs;
    }

    public convert(): ExampleConverter.Output {
        if (this.depth > this.MAX_DEPTH) {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: this.example !== undefined,
                validExample: typeof this.example !== "undefined" ? this.example : {},
                errors: []
            };
        }

        if (this.context.isReferenceObject(this.schema)) {
            const ref = this.schema.$ref;
            if (this.seenRefs.has(ref)) {
                return {
                    isValid: true,
                    coerced: false,
                    usedProvidedExample: this.example !== undefined,
                    validExample: this.example,
                    errors: []
                };
            }
        }

        const resolvedSchema = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
            schemaOrReference: this.schema,
            breadcrumbs: this.breadcrumbs,
            skipErrorCollector: true
        });
        if (resolvedSchema == null) {
            return {
                isValid: false,
                coerced: false,
                usedProvidedExample: false,
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
                usedProvidedExample: false,
                validExample: null,
                errors: [
                    {
                        message: `Schema should be an object: ${JSON.stringify(resolvedSchema, null, 2)}`,
                        path: this.breadcrumbs
                    }
                ]
            };
        }
        if (
            !this.generateOptionalProperties &&
            "nullable" in resolvedSchema &&
            resolvedSchema.nullable === true &&
            this.example === null
        ) {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: true,
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
                usedProvidedExample: this.example !== undefined,
                validExample: this.example,
                errors: []
            };
        }

        return {
            isValid: false,
            coerced: false,
            usedProvidedExample: false,
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
                  usedProvidedExample: true,
                  validExample: this.example,
                  errors: []
              }
            : {
                  isValid: false,
                  coerced: false,
                  usedProvidedExample: false,
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
        const resolvedSchema = this.context.isReferenceObject(this.schema)
            ? this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                  schemaOrReference: this.schema,
                  breadcrumbs: this.breadcrumbs
              })
            : this.schema;

        if (
            !this.generateOptionalProperties &&
            resolvedSchema &&
            "nullable" in resolvedSchema &&
            resolvedSchema.nullable === true &&
            this.example === null
        ) {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: true,
                validExample: this.example,
                errors: []
            };
        }

        const isValid = typeof this.example === "boolean";
        if (isValid) {
            return {
                isValid,
                coerced: false,
                usedProvidedExample: true,
                validExample: this.example,
                errors: []
            };
        }

        const resolvedDefault = resolvedSchema?.default;

        const resolvedConst = this.context.isReferenceObject(this.schema)
            ? this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                  schemaOrReference: this.schema,
                  breadcrumbs: this.breadcrumbs
              })?.const
            : this.schema.const;

        if (typeof resolvedDefault === "boolean" || typeof resolvedConst === "boolean") {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: false,
                validExample: resolvedConst ?? resolvedDefault,
                errors: []
            };
        }

        return {
            isValid: false,
            coerced: false,
            usedProvidedExample: false,
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
                usedProvidedExample: true,
                validExample: this.example,
                errors: []
            };
        }

        const resolvedDefault = this.context.isReferenceObject(this.schema)
            ? this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                  schemaOrReference: this.schema,
                  breadcrumbs: this.breadcrumbs,
                  skipErrorCollector: true
              })?.default
            : this.schema.default;

        if (resolvedDefault !== undefined && resolvedSchema.enum?.includes(resolvedDefault)) {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: false,
                validExample: resolvedDefault,
                errors: []
            };
        }

        return {
            isValid,
            coerced: false,
            usedProvidedExample: false,
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
        const resolvedSchema: OpenAPIV3_1.SchemaObject | undefined = this.context.isReferenceObject(this.schema)
            ? this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                  schemaOrReference: this.schema,
                  breadcrumbs: this.breadcrumbs,
                  skipErrorCollector: true
              })
            : this.schema;

        if (
            !this.generateOptionalProperties &&
            resolvedSchema &&
            "nullable" in resolvedSchema &&
            resolvedSchema.nullable === true &&
            this.example === null
        ) {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: true,
                validExample: this.example,
                errors: []
            };
        }

        if (typeof this.example === "number") {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: true,
                validExample: this.example,
                errors: []
            };
        }

        const num = Number(this.example);
        if (!isNaN(num) && this.example != null) {
            return {
                isValid: true,
                coerced: true,
                usedProvidedExample: true,
                validExample: num,
                errors: []
            };
        }

        const resolvedDefault = resolvedSchema?.default;

        if (typeof resolvedDefault === "number") {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: false,
                validExample: resolvedDefault,
                errors: []
            };
        }

        return {
            isValid: false,
            coerced: false,
            usedProvidedExample: false,
            validExample: this.adjustNumberToConstraints(
                this.maybeResolveSchemaExample<number>(this.schema) ?? this.EXAMPLE_NUMBER,
                resolvedSchema
            ),
            errors: [
                {
                    message: `Example is not a number: ${JSON.stringify(this.example, null, 2)}`,
                    path: this.breadcrumbs
                }
            ]
        };
    }

    /**
     * Adjusts a number to respect the min/max constraints defined in the schema
     */
    private adjustNumberToConstraints(number: number, schemaObj?: OpenAPIV3_1.SchemaObject): number {
        if (schemaObj == null) {
            this.context.logger.debug(
                "[ExampleConverter.adjustNumberToConstraints] Schema object is null, returning original number",
                "number:",
                number.toString()
            );
            return number;
        }

        const { minimum, maximum, exclusiveMinimum, exclusiveMaximum } = schemaObj;

        // Calculate lower bound
        let lowerBound: number | undefined = undefined;
        if (exclusiveMinimum != null) {
            if (typeof exclusiveMinimum === "boolean") {
                // Boolean true means minimum is exclusive
                lowerBound =
                    minimum != null ? minimum + Math.max(Number.EPSILON, Math.abs(minimum) * 1e-10) : undefined;
            } else {
                // Number value is the exclusive minimum
                lowerBound = exclusiveMinimum + Math.max(Number.EPSILON, Math.abs(exclusiveMinimum) * 1e-10);
            }
        } else if (minimum != null) {
            lowerBound = minimum;
        }

        // Calculate upper bound
        let upperBound: number | undefined = undefined;
        if (exclusiveMaximum != null) {
            if (typeof exclusiveMaximum === "boolean") {
                // Boolean true means maximum is exclusive
                upperBound =
                    maximum != null
                        ? maximum - Math.max(Number.EPSILON, Math.abs(maximum) * Number.EPSILON)
                        : undefined;
            } else {
                // Number value is the exclusive maximum
                upperBound = exclusiveMaximum - Math.max(Number.EPSILON, Math.abs(exclusiveMaximum) * Number.EPSILON);
            }
        } else if (maximum != null) {
            upperBound = maximum;
        }

        if (lowerBound !== undefined && upperBound !== undefined) {
            if (number < lowerBound || number > upperBound) {
                number = lowerBound + (upperBound - lowerBound) / 2;
            }
        }
        // If only lower bound exists and number is below it, adjust upwards
        else if (lowerBound !== undefined && number < lowerBound) {
            number = lowerBound + Math.abs(lowerBound * 0.1);
        }
        // If only upper bound exists and number is above it, adjust downwards
        else if (upperBound !== undefined && number > upperBound) {
            number = upperBound - Math.abs(upperBound * 0.1);
        }

        return Number(Number(number).toPrecision(3));
    }

    private convertString(): ExampleConverter.Output {
        const resolvedSchema = this.context.isReferenceObject(this.schema)
            ? this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                  schemaOrReference: this.schema,
                  breadcrumbs: this.breadcrumbs,
                  skipErrorCollector: true
              })
            : this.schema;

        if (
            !this.generateOptionalProperties &&
            resolvedSchema &&
            "nullable" in resolvedSchema &&
            resolvedSchema.nullable === true &&
            this.example === null
        ) {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: true,
                validExample: this.example,
                errors: []
            };
        }

        if (typeof this.example === "string") {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: true,
                validExample: this.example,
                errors: []
            };
        }

        if (typeof this.example !== "object" && !Array.isArray(this.example) && this.example != null) {
            const stringValue = String(this.example);
            return {
                isValid: true,
                coerced: true,
                usedProvidedExample: true,
                validExample: stringValue,
                errors: []
            };
        }

        const resolvedDefault = resolvedSchema?.default;

        if (typeof resolvedDefault === "string") {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: false,
                validExample: resolvedDefault,
                errors: []
            };
        }

        // Check for date formats and use appropriate examples

        const dateFallbackExample =
            resolvedSchema?.format === "date"
                ? this.EXAMPLE_DATE
                : resolvedSchema?.format === "date-time"
                  ? this.EXAMPLE_DATE_TIME
                  : this.EXAMPLE_STRING;

        return {
            isValid: false,
            coerced: false,
            usedProvidedExample: false,
            validExample: this.maybeResolveSchemaExample<string>(this.schema) ?? dateFallbackExample,
            errors: [
                {
                    message: `Example cannot be converted to string: ${JSON.stringify(this.example, null, 2)}`,
                    path: this.breadcrumbs
                }
            ]
        };
    }

    private convertInteger(): ExampleConverter.Output {
        const resolvedSchema = this.context.isReferenceObject(this.schema)
            ? this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                  schemaOrReference: this.schema,
                  breadcrumbs: this.breadcrumbs,
                  skipErrorCollector: true
              })
            : this.schema;

        if (
            !this.generateOptionalProperties &&
            resolvedSchema &&
            "nullable" in resolvedSchema &&
            resolvedSchema.nullable === true &&
            this.example === null
        ) {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: true,
                validExample: this.example,
                errors: []
            };
        }

        if (typeof this.example === "number" && Number.isInteger(this.example)) {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: true,
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
                    usedProvidedExample: true,
                    validExample: num,
                    errors: []
                };
            }
        }

        const resolvedDefault = resolvedSchema?.default;
        if (typeof resolvedDefault === "number" && Number.isInteger(resolvedDefault)) {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: false,
                validExample: resolvedDefault,
                errors: []
            };
        }

        return {
            isValid: false,
            coerced: false,
            usedProvidedExample: false,
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
            return { isValid: false, coerced: false, usedProvidedExample: false, validExample: null, errors: [] };
        }

        if (
            !this.generateOptionalProperties &&
            "nullable" in resolvedSchema &&
            resolvedSchema.nullable === true &&
            this.example === null
        ) {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: true,
                validExample: this.example,
                errors: []
            };
        }
        if (resolvedSchema.items == null) {
            resolvedSchema.items = { type: "string" };
        }
        const usedFallbackExample = this.example == null;
        const maybeExampleArray = this.example ?? resolvedSchema.example;
        const exampleArray = Array.isArray(maybeExampleArray) ? maybeExampleArray : [maybeExampleArray];
        const results = exampleArray.map((item) => {
            const exampleConverter = new ExampleConverter({
                breadcrumbs: [...this.breadcrumbs, "items"],
                context: this.context,
                schema: resolvedSchema.items,
                example: item,
                depth: this.depth,
                generateOptionalProperties: this.generateOptionalProperties,
                exampleGenerationStrategy: this.exampleGenerationStrategy,
                seenRefs: this.getMaybeUpdatedSeenRefs()
            });
            return exampleConverter.convert();
        });

        const isValid = results.every((result) => result?.isValid ?? false) && !usedFallbackExample;
        const usedProvidedExample = !usedFallbackExample && results.some((result) => result.usedProvidedExample);

        return {
            isValid,
            coerced: false,
            usedProvidedExample,
            validExample: results.map((result) => result.validExample),
            errors: isValid ? [] : results.flatMap((result) => result.errors)
        };
    }

    private convertObject({ resolvedSchema }: { resolvedSchema: OpenAPIV3_1.SchemaObject }): ExampleConverter.Output {
        if (resolvedSchema.type == "object" && resolvedSchema.properties == null && resolvedSchema.allOf == null) {
            return {
                isValid: true,
                coerced: false,
                usedProvidedExample: this.example !== undefined,
                validExample: this.example ?? {},
                errors: []
            };
        }

        const exampleObj =
            typeof this.example !== "object" || this.example == null ? {} : (this.example as Record<string, unknown>);

        const resultsByKey = Object.entries(resolvedSchema.properties ?? {}).map(([key, property]) => {
            if (typeof property !== "object") {
                return {
                    key,
                    result: {
                        isValid: true,
                        coerced: false,
                        usedProvidedExample: false,
                        validExample: undefined,
                        errors: []
                    }
                };
            }

            if (this.isDeprecatedProperty(property)) {
                const isOptionalProperty = !this.isRequiredProperty({ key, resolvedSchema });
                if (isOptionalProperty) {
                    return {
                        key,
                        result: {
                            isValid: true,
                            coerced: false,
                            usedProvidedExample: false,
                            validExample: undefined,
                            errors: []
                        }
                    };
                }
            }

            if (
                "readOnly" in property &&
                property.readOnly === true &&
                "writeOnly" in property &&
                property.writeOnly === true
            ) {
                return {
                    key,
                    result: {
                        isValid: true,
                        coerced: false,
                        usedProvidedExample: false,
                        validExample: undefined,
                        errors: []
                    }
                };
            }
            // TODO: Do we want to collect an error when the request / response example does not respect the readOnly / writeOnly property?
            if ("readOnly" in property && property.readOnly === true && this.exampleGenerationStrategy === "request") {
                return {
                    key,
                    result: {
                        isValid: true,
                        coerced: false,
                        usedProvidedExample: false,
                        validExample: undefined,
                        errors: []
                    }
                };
            }
            if (
                "writeOnly" in property &&
                property.writeOnly === true &&
                this.exampleGenerationStrategy === "response"
            ) {
                return {
                    key,
                    result: {
                        isValid: true,
                        coerced: false,
                        usedProvidedExample: false,
                        validExample: undefined,
                        errors: []
                    }
                };
            }
            const propertyIsOmittedFromExample =
                !(key in exampleObj) ||
                (!("nullable" in property) && exampleObj[key] == null) ||
                ("nullable" in property && property.nullable === true && exampleObj[key] === undefined);
            const propertyIsOptional = !resolvedSchema.required?.includes(key);

            if (propertyIsOmittedFromExample && propertyIsOptional) {
                if (this.example === undefined && this.generateOptionalProperties) {
                    const propertyExample = this.maybeResolveSchemaExample(property);
                    const exampleConverter = new ExampleConverter({
                        breadcrumbs: [...this.breadcrumbs, key],
                        context: this.context,
                        schema: property,
                        example: propertyExample,
                        depth: this.depth + 1,
                        generateOptionalProperties: this.generateOptionalProperties,
                        exampleGenerationStrategy: this.exampleGenerationStrategy,
                        seenRefs: this.getMaybeUpdatedSeenRefs()
                    });
                    return { key, result: exampleConverter.convert() };
                }
                return {
                    key,
                    result: {
                        isValid: true,
                        coerced: false,
                        usedProvidedExample: false,
                        validExample: undefined,
                        errors: []
                    }
                };
            } else {
                const propExampleFromParent = exampleObj[key];
                const propertyExample = propExampleFromParent ?? this.maybeResolveSchemaExample(property);
                const exampleConverter = new ExampleConverter({
                    breadcrumbs: [...this.breadcrumbs, key],
                    context: this.context,
                    schema: property,
                    example: propertyExample,
                    depth: this.depth + 1,
                    generateOptionalProperties: this.generateOptionalProperties,
                    exampleGenerationStrategy: this.exampleGenerationStrategy,
                    seenRefs: this.getMaybeUpdatedSeenRefs()
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
                exampleGenerationStrategy: this.exampleGenerationStrategy,
                seenRefs: this.getMaybeUpdatedSeenRefs()
            });
            return exampleConverter.convert();
        });

        const isValid =
            resultsByKey.every((entry) => entry.result.isValid) && allOfResults.every((result) => result.isValid);

        const usedProvidedExample =
            this.example !== undefined &&
            (resultsByKey.some(({ result }) => result.usedProvidedExample) ||
                allOfResults.some((result) => result.usedProvidedExample));

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

        // Handle additional properties
        const additionalPropertiesResults: Array<{ key: string; result: ExampleConverter.Output }> = [];
        if (resolvedSchema.additionalProperties !== false) {
            const additionalPropertiesSchema: OpenAPIV3_1.SchemaObject =
                typeof resolvedSchema.additionalProperties === "object"
                    ? resolvedSchema.additionalProperties
                    : ({
                          oneOf: [
                              { type: "string" },
                              { type: "number" },
                              { type: "boolean" },
                              { type: "object" },
                              { type: "array" }
                          ]
                          // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                      } as any);

            // Find properties in the example that are not defined in the schema
            const definedPropertyKeys = new Set(Object.keys(example ?? {}));
            const additionalPropertyKeys = Object.keys(exampleObj).filter((key) => !definedPropertyKeys.has(key));

            additionalPropertyKeys.forEach((key) => {
                const exampleConverter = new ExampleConverter({
                    breadcrumbs: [...this.breadcrumbs, key],
                    context: this.context,
                    schema: additionalPropertiesSchema,
                    example: exampleObj[key],
                    depth: this.depth + 1,
                    generateOptionalProperties: false,
                    exampleGenerationStrategy: this.exampleGenerationStrategy,
                    seenRefs: this.getMaybeUpdatedSeenRefs()
                });
                const result = exampleConverter.convert();
                additionalPropertiesResults.push({ key, result });
            });
        }

        // Add additional properties to the example
        for (const { key, result } of additionalPropertiesResults) {
            if (result.validExample !== undefined && example[key] === undefined) {
                example[key] = result.validExample;
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
            usedProvidedExample,
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
            return { isValid: false, coerced: false, usedProvidedExample: false, validExample: null, errors: [] };
        }
        if (resolvedSchema.type.length === 1) {
            const exampleConverter = new ExampleConverter({
                breadcrumbs: this.breadcrumbs,
                context: this.context,
                schema: { ...resolvedSchema, type: resolvedSchema.type[0] } as OpenAPIV3_1.SchemaObject,
                example: this.example,
                depth: this.depth,
                generateOptionalProperties: this.generateOptionalProperties,
                exampleGenerationStrategy: this.exampleGenerationStrategy,
                seenRefs: this.getMaybeUpdatedSeenRefs()
            });
            return exampleConverter.convert();
        }
        const results = resolvedSchema.type.map((subSchema, index) => {
            const exampleConverter = new ExampleConverter({
                breadcrumbs: [...this.breadcrumbs, `type[${index}]`],
                context: this.context,
                schema: { ...resolvedSchema, type: subSchema } as OpenAPIV3_1.SchemaObject,
                example: this.example,
                depth: this.depth,
                generateOptionalProperties: this.generateOptionalProperties,
                exampleGenerationStrategy: this.exampleGenerationStrategy,
                seenRefs: this.getMaybeUpdatedSeenRefs()
            });
            return exampleConverter.convert();
        });

        const isValid = results.some((result) => result?.isValid ?? false);

        const validExample = results.find((result) => result.isValid)?.validExample;
        const example = validExample ?? results[0]?.validExample ?? null;
        const usedProvidedExample = results.some((result) => result.usedProvidedExample);

        return {
            isValid,
            coerced: false,
            usedProvidedExample,
            validExample: example,
            errors: isValid ? [] : results.flatMap((result) => result?.errors ?? [])
        };
    }

    private convertUnion({
        resolvedSchema,
        unionType
    }: {
        resolvedSchema: OpenAPIV3_1.SchemaObject;
        unionType: "oneOf" | "anyOf";
    }): ExampleConverter.Output {
        const unionSchemas = unionType === "oneOf" ? resolvedSchema.oneOf : resolvedSchema.anyOf;

        if (!(unionType in resolvedSchema) || unionSchemas == null) {
            return { isValid: false, coerced: false, usedProvidedExample: false, validExample: null, errors: [] };
        }

        const containerExample = this.example ?? this.maybeResolveSchemaExample(resolvedSchema);

        const results: ExampleConverter.Output[] = [];
        let firstValidResult: ExampleConverter.Output | null = null;
        let firstValidWithProvidedExample: ExampleConverter.Output | null = null;

        for (let index = 0; index < unionSchemas.length; index++) {
            const subSchema = unionSchemas[index];
            if (!subSchema) {
                continue;
            }

            // Different schema handling for oneOf vs anyOf
            const schemaToUse =
                unionType === "oneOf" ? { ...resolvedSchema, ...subSchema, oneOf: undefined } : subSchema;

            const variantExample = containerExample ?? this.maybeResolveSchemaExample(schemaToUse);

            const exampleConverter = new ExampleConverter({
                breadcrumbs: [...this.breadcrumbs, `${unionType}[${index}]`],
                context: this.context,
                schema: schemaToUse,
                example: variantExample,
                depth: this.depth + 1,
                generateOptionalProperties: this.generateOptionalProperties,
                exampleGenerationStrategy: this.exampleGenerationStrategy,
                seenRefs: this.getMaybeUpdatedSeenRefs()
            });

            const result = exampleConverter.convert();

            if (result.isValid && !result.coerced && result.usedProvidedExample) {
                return {
                    isValid: true,
                    coerced: false,
                    usedProvidedExample: true,
                    validExample: result.validExample,
                    errors: []
                };
            }

            // If valid and non-coerced (but didn't use provided example), return immediately
            if (result.isValid && !result.coerced) {
                return {
                    isValid: true,
                    coerced: false,
                    usedProvidedExample: result.usedProvidedExample,
                    validExample: result.validExample,
                    errors: []
                };
            }

            results.push(result);

            // Track first valid result that used provided example
            if (result.isValid && result.usedProvidedExample && firstValidWithProvidedExample === null) {
                firstValidWithProvidedExample = result;
            }

            // Track first valid result (even if coerced) as fallback
            if (result.isValid && firstValidResult === null) {
                firstValidResult = result;
            }
        }

        const selectedResult = firstValidWithProvidedExample ?? firstValidResult;
        const isValid = selectedResult !== null;
        const validExample = selectedResult?.validExample ?? results[0]?.validExample;
        const usedProvidedExample = selectedResult?.usedProvidedExample ?? false;

        return {
            isValid,
            coerced: false,
            usedProvidedExample,
            validExample,
            errors: isValid ? [] : results.flatMap((result) => result.errors)
        };
    }

    private convertOneOf({ resolvedSchema }: { resolvedSchema: OpenAPIV3_1.SchemaObject }): ExampleConverter.Output {
        return this.convertUnion({ resolvedSchema, unionType: "oneOf" });
    }

    private convertAnyOf({ resolvedSchema }: { resolvedSchema: OpenAPIV3_1.SchemaObject }): ExampleConverter.Output {
        return this.convertUnion({ resolvedSchema, unionType: "anyOf" });
    }
    private getMaybeUpdatedSeenRefs() {
        const newSeenRefs = new Set(this.seenRefs);
        if (this.context.isReferenceObject(this.schema)) {
            newSeenRefs.add(this.schema.$ref);
        }
        return newSeenRefs;
    }

    private maybeResolveSchemaExample<Type>(
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
    ): Type | undefined {
        const resolvedSchema = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
            schemaOrReference: schema,
            breadcrumbs: this.breadcrumbs,
            skipErrorCollector: true
        });
        if (resolvedSchema == null) {
            return undefined;
        }
        if ("example" in resolvedSchema) {
            return resolvedSchema.example as Type;
        }
        if ("examples" in resolvedSchema) {
            const examples = resolvedSchema.examples;
            if (Array.isArray(examples) && examples.length > 0) {
                return examples[0] as Type;
            }
            return Object.values(examples ?? {})[0] as Type;
        }
        return undefined;
    }

    private isDeprecatedProperty(
        property: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
    ): property is OpenAPIV3_1.SchemaObject & { availability: "deprecated" } {
        return property != null && "availability" in property && property.availability === "deprecated";
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
}
