import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext, ErrorCollector } from "..";

export declare namespace ExampleConverter {
    export interface Args extends AbstractConverter.Args<AbstractConverterContext<object>> {
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        example: unknown;
        depth?: number;
    }

    export interface Error {
        message: string;
        path: string[];
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
        errors: Error[];
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

    constructor({ breadcrumbs, context, schema, example, depth = 0 }: ExampleConverter.Args) {
        super({ breadcrumbs, context });
        this.example = example;
        this.schema = schema;
        this.depth = depth;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<ExampleConverter.Output> {
        if (this.depth > this.MAX_DEPTH) {
            return { isValid: true, coerced: false, validExample: this.example, errors: [] };
        }
        let resolvedSchema: OpenAPIV3_1.SchemaObject | undefined;
        if (context.isReferenceObject(this.schema)) {
            const resolved = await context.resolveReference<OpenAPIV3_1.SchemaObject>(this.schema);
            if (resolved.resolved) {
                resolvedSchema = resolved.value;
            }
        } else {
            resolvedSchema = this.schema;
        }
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

        if ("nullable" in resolvedSchema && resolvedSchema.nullable === true && this.example === null) {
            return {
                isValid: true,
                coerced: false,
                validExample: this.example,
                errors: []
            };
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

        if (resolvedSchema.type == "array" && "items" in resolvedSchema) {
            return this.convertArray({
                resolvedSchema,
                context,
                errorCollector
            });
        }

        if (resolvedSchema.type == "object" || resolvedSchema.properties != null) {
            return this.convertObject({
                resolvedSchema,
                context,
                errorCollector
            });
        }

        if (Array.isArray(resolvedSchema.type)) {
            return this.convertSchemaTypeArray({
                resolvedSchema,
                context,
                errorCollector
            });
        }

        if ("allOf" in resolvedSchema && resolvedSchema.allOf != null) {
            return this.convertAllOf({
                resolvedSchema,
                context,
                errorCollector
            });
        }

        if ("oneOf" in resolvedSchema && resolvedSchema.oneOf != null) {
            return this.convertOneOf({
                resolvedSchema,
                context,
                errorCollector
            });
        }

        if ("anyOf" in resolvedSchema && resolvedSchema.anyOf != null) {
            return this.convertAnyOf({
                resolvedSchema,
                context,
                errorCollector
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
                  validExample: this.EXAMPLE_BOOLEAN,
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
        return isValid
            ? {
                  isValid,
                  coerced: false,
                  validExample: this.example,
                  errors: []
              }
            : {
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

        return {
            isValid: false,
            coerced: false,
            validExample: this.EXAMPLE_NUMBER,
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

        return {
            isValid: false,
            coerced: false,
            validExample: this.EXAMPLE_STRING,
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

        return {
            isValid: false,
            coerced: false,
            validExample: this.EXAMPLE_INTEGER,
            errors: [
                {
                    message: `Example is not an integer: ${JSON.stringify(this.example, null, 2)}`,
                    path: this.breadcrumbs
                }
            ]
        };
    }

    private async convertArray({
        resolvedSchema,
        context,
        errorCollector
    }: {
        resolvedSchema: OpenAPIV3_1.SchemaObject;
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<ExampleConverter.Output> {
        if (resolvedSchema.type != "array" || resolvedSchema.items == null) {
            return { isValid: false, coerced: false, validExample: null, errors: [] };
        }
        if (!Array.isArray(this.example) || resolvedSchema.items == null) {
            const exampleConverter = new ExampleConverter({
                breadcrumbs: [...this.breadcrumbs, "items"],
                context,
                schema: resolvedSchema.items,
                example: null,
                depth: this.depth + 1
            });
            const { validExample } = await exampleConverter.convert({ context, errorCollector });
            return {
                isValid: false,
                coerced: false,
                validExample: [validExample],
                errors: [
                    {
                        message: `Example is not an array: ${JSON.stringify(this.example, null, 2)}`,
                        path: this.breadcrumbs
                    }
                ]
            };
        }
        const results = await Promise.all(
            this.example.map(async (item, index) => {
                const exampleConverter = new ExampleConverter({
                    breadcrumbs: [...this.breadcrumbs, `Item[${index}]`],
                    context,
                    schema: resolvedSchema.items,
                    example: item,
                    depth: this.depth + 1
                });
                return await exampleConverter.convert({ context, errorCollector });
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
        resolvedSchema,
        context,
        errorCollector
    }: {
        resolvedSchema: OpenAPIV3_1.SchemaObject;
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<ExampleConverter.Output> {
        if (resolvedSchema.type == "object" && resolvedSchema.properties == null) {
            return { isValid: true, coerced: false, validExample: this.example ?? {}, errors: [] };
        }
        const exampleObj =
            typeof this.example !== "object" || this.example == null ? {} : (this.example as Record<string, unknown>);
        const resultsByKey = await Promise.all(
            Object.entries(resolvedSchema.properties ?? {}).map(async ([key, property]) => {
                const isOmittedFromExample =
                    !(key in exampleObj) ||
                    (!("nullable" in property) && exampleObj[key] == null) ||
                    ("nullable" in property && property.nullable === true && exampleObj[key] === undefined);
                const isOptional = !resolvedSchema.required?.includes(key);
                if (isOmittedFromExample && isOptional) {
                    return { key, result: { isValid: true, coerced: false, validExample: undefined, errors: [] } };
                }
                const exampleConverter = new ExampleConverter({
                    breadcrumbs: [...this.breadcrumbs, key],
                    context,
                    schema: property,
                    example: exampleObj[key],
                    depth: this.depth + 1
                });
                const result = await exampleConverter.convert({ context, errorCollector });
                return { key, result };
            })
        );

        const isValid = resultsByKey.every((entry) => entry.result.isValid);

        const example = Object.fromEntries(
            resultsByKey
                .map(({ key, result }) => [key, result.validExample])
                .filter(([_, value]) => value !== undefined)
        );

        return {
            isValid,
            coerced: false,
            validExample: example,
            errors: isValid ? [] : resultsByKey.flatMap(({ result }) => result.errors)
        };
    }

    private async convertSchemaTypeArray({
        resolvedSchema,
        context,
        errorCollector
    }: {
        resolvedSchema: OpenAPIV3_1.SchemaObject;
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<ExampleConverter.Output> {
        if (!Array.isArray(resolvedSchema.type)) {
            return { isValid: false, coerced: false, validExample: null, errors: [] };
        }
        const results = await Promise.all(
            resolvedSchema.type.map(async (subSchema, index) => {
                const exampleConverter = new ExampleConverter({
                    breadcrumbs: [...this.breadcrumbs, `type[${index}]`],
                    context,
                    schema: { ...resolvedSchema, type: subSchema } as OpenAPIV3_1.SchemaObject,
                    example: this.example,
                    depth: this.depth + 1
                });
                return await exampleConverter.convert({ context, errorCollector });
            })
        );

        const isValid = results.some((result) => result?.isValid ?? false);

        const validSubSchemaExample = results.find((result) => result.isValid)?.validExample;
        const example = validSubSchemaExample ?? null;

        return {
            isValid,
            coerced: false,
            validExample: example,
            errors: isValid ? [] : results.flatMap((result) => result?.errors ?? [])
        };
    }

    private async convertAllOf({
        resolvedSchema,
        context,
        errorCollector
    }: {
        resolvedSchema: OpenAPIV3_1.SchemaObject;
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<ExampleConverter.Output> {
        if (!("allOf" in resolvedSchema) || resolvedSchema.allOf == null) {
            return { isValid: false, coerced: false, validExample: null, errors: [] };
        }
        const results = await Promise.all(
            resolvedSchema.allOf.map(async (subSchema, index) => {
                const exampleConverter = new ExampleConverter({
                    breadcrumbs: [...this.breadcrumbs, `allOf[${index}]`],
                    context,
                    schema: subSchema,
                    example: this.example,
                    depth: this.depth + 1
                });
                return await exampleConverter.convert({ context, errorCollector });
            })
        );

        const isValid = results.every((entry) => entry.isValid);

        if (results.some((result) => typeof result.validExample !== "object" || result.validExample === null)) {
            const firstValidResult = results.find(
                (result) => typeof result.validExample !== "object" && result.validExample !== undefined
            );
            return {
                isValid,
                coerced: false,
                validExample: firstValidResult?.validExample ?? null,
                errors: isValid ? [] : results.flatMap((result) => result.errors)
            };
        }

        const example = results.reduce((acc, result) => {
            const exampleObj = result.validExample as Record<string, unknown>;
            const filteredEntries = Object.entries(exampleObj).filter(([_, value]) => value !== undefined);
            return {
                ...acc,
                ...Object.fromEntries(filteredEntries)
            };
        }, {});

        return {
            isValid,
            coerced: false,
            validExample: example,
            errors: isValid ? [] : results.flatMap((result) => result.errors)
        };
    }

    private async convertOneOf({
        resolvedSchema,
        context,
        errorCollector
    }: {
        resolvedSchema: OpenAPIV3_1.SchemaObject;
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<ExampleConverter.Output> {
        if (!("oneOf" in resolvedSchema) || resolvedSchema.oneOf == null) {
            return { isValid: false, coerced: false, validExample: null, errors: [] };
        }
        const results = await Promise.all(
            resolvedSchema.oneOf.map(async (subSchema, index) => {
                const exampleConverter = new ExampleConverter({
                    breadcrumbs: [...this.breadcrumbs, `oneOf[${index}]`],
                    context,
                    schema: subSchema,
                    example: this.example,
                    depth: this.depth + 1
                });
                return await exampleConverter.convert({ context, errorCollector });
            })
        );

        const validResults = results.filter((result) => result.isValid);
        const isValid = validResults.length > 0;

        const nonCoercedResult = validResults.find((result) => !result.coerced);
        const validExample = nonCoercedResult?.validExample ?? validResults[0]?.validExample;

        return {
            isValid,
            coerced: false,
            validExample,
            errors: isValid ? [] : results.flatMap((result) => result.errors)
        };
    }

    private async convertAnyOf({
        resolvedSchema,
        context,
        errorCollector
    }: {
        resolvedSchema: OpenAPIV3_1.SchemaObject;
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<ExampleConverter.Output> {
        if (!("anyOf" in resolvedSchema) || resolvedSchema.anyOf == null) {
            return { isValid: false, coerced: false, validExample: null, errors: [] };
        }
        const results = await Promise.all(
            resolvedSchema.anyOf.map(async (subSchema, index) => {
                const exampleConverter = new ExampleConverter({
                    breadcrumbs: [...this.breadcrumbs, `anyOf[${index}]`],
                    context,
                    schema: subSchema,
                    example: this.example,
                    depth: this.depth + 1
                });
                return await exampleConverter.convert({ context, errorCollector });
            })
        );

        const validResults = results.filter((result) => result.isValid);
        const isValid = validResults.length > 0;

        const nonCoercedResult = validResults.find((result) => !result.coerced);
        const validExample = nonCoercedResult?.validExample ?? validResults[0]?.validExample;

        return {
            isValid,
            coerced: false,
            validExample,
            errors: isValid ? [] : results.flatMap((result) => result.errors)
        };
    }
}
