import { HttpHeader, PathParameter, QueryParameter, TypeId, TypeReference, V2SchemaExamples } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext, APIErrorLevel } from "../..";
import { ExampleConverter } from "../ExampleConverter";
import { SchemaConverter } from "../schema/SchemaConverter";

export declare namespace AbstractParameterConverter {
    export interface Args<TParameter extends OpenAPIV3_1.ParameterObject> extends AbstractConverter.AbstractArgs {
        parameter: TParameter;
    }

    export interface BaseParameterOutput {
        inlinedTypes?: Record<TypeId, SchemaConverter.ConvertedSchema>;
    }

    export interface QueryParameterOutput extends BaseParameterOutput {
        type: "query";
        parameter: QueryParameter;
    }

    export interface HeaderParameterOutput extends BaseParameterOutput {
        type: "header";
        parameter: HttpHeader;
    }

    export interface PathParameterOutput extends BaseParameterOutput {
        type: "path";
        parameter: PathParameter;
    }

    export type Output = QueryParameterOutput | HeaderParameterOutput | PathParameterOutput;
}

export abstract class AbstractParameterConverter<
    TParameter extends OpenAPIV3_1.ParameterObject
> extends AbstractConverter<AbstractConverterContext<object>, AbstractParameterConverter.Output> {
    protected readonly parameter: TParameter;

    constructor({ context, breadcrumbs, parameter }: AbstractParameterConverter.Args<TParameter>) {
        super({ context, breadcrumbs });
        this.parameter = parameter;
    }

    public abstract convert(): AbstractParameterConverter.Output | undefined;

    protected convertToOutput({
        schema,
        typeReference,
        inlinedTypes
    }: {
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        typeReference: TypeReference | undefined;
        inlinedTypes: Record<TypeId, SchemaConverter.ConvertedSchema> | undefined;
    }): AbstractParameterConverter.Output | undefined {
        const availability = this.context.getAvailability({
            node: this.parameter,
            breadcrumbs: this.breadcrumbs
        });

        const resolvedParameterSchema: OpenAPIV3_1.SchemaObject | undefined =
            this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                schemaOrReference: schema,
                breadcrumbs: this.breadcrumbs
            });

        const parameterSchemaWithExampleOverride = this.getParameterSchemaWithExampleOverride({
            schema: resolvedParameterSchema
        });

        switch (this.parameter.in) {
            case "query":
                return {
                    type: "query",
                    parameter: {
                        name: this.context.casingsGenerator.generateNameAndWireValue({
                            name: this.parameter.name,
                            wireValue: this.parameter.name
                        }),
                        docs: this.parameter.description,
                        valueType: typeReference ?? AbstractConverter.OPTIONAL_STRING,
                        allowMultiple: this.parameter.explode ?? false,
                        v2Examples: this.convertParameterExamples({
                            schema: parameterSchemaWithExampleOverride ?? schema
                        }),
                        availability,
                        explode: this.getExplodeForQueryParameter()
                    },
                    inlinedTypes
                };
            case "header":
                return {
                    type: "header",
                    parameter: {
                        name: this.context.casingsGenerator.generateNameAndWireValue({
                            name: this.parameter.name,
                            wireValue: this.parameter.name
                        }),
                        docs: this.parameter.description,
                        valueType: typeReference ?? AbstractConverter.OPTIONAL_STRING,
                        env: undefined,
                        v2Examples: this.convertParameterExamples({
                            schema: parameterSchemaWithExampleOverride ?? schema
                        }),
                        availability
                    },
                    inlinedTypes
                };
            case "path":
                return {
                    type: "path",
                    parameter: {
                        name: this.context.casingsGenerator.generateName(this.parameter.name),
                        docs: this.parameter.description,
                        valueType: typeReference ?? AbstractConverter.STRING,
                        location: "ENDPOINT",
                        variable: undefined,
                        v2Examples: this.convertParameterExamples({
                            schema: parameterSchemaWithExampleOverride ?? schema
                        }),
                        explode: this.getExplodeForPathParameter()
                    },
                    inlinedTypes
                };
            default:
                return undefined;
        }
    }

    private getParameterSchemaWithExampleOverride({
        schema
    }: {
        schema: OpenAPIV3_1.SchemaObject | undefined;
    }): OpenAPIV3_1.SchemaObject | undefined {
        if (schema == null) {
            return undefined;
        }

        if (schema.type === "string" && schema.example == null) {
            return {
                ...schema,
                example: this.parameter.name
            };
        }

        return schema;
    }

    protected convertParameterExamples({
        schema
    }: {
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    }): V2SchemaExamples {
        const v2Examples: V2SchemaExamples = {
            userSpecifiedExamples: {},
            autogeneratedExamples: {}
        };

        const parameterExample = this.parameter.example;
        const parameterExamples = this.parameter.examples;

        for (const [key, example] of Object.entries(parameterExamples ?? {})) {
            const resolvedExample = this.context.resolveExampleWithValue(example);
            if (resolvedExample != null) {
                v2Examples.userSpecifiedExamples[key] = this.generateOrValidateExample({
                    schema,
                    example: resolvedExample,
                    exampleName: key
                });
            }
        }

        if (parameterExample != null) {
            const parameterExampleName = this.context.generateUniqueName({
                prefix: `${this.parameter.name}_example`,
                existingNames: Object.keys(v2Examples.userSpecifiedExamples)
            });
            v2Examples.userSpecifiedExamples[parameterExampleName] = this.generateOrValidateExample({
                schema,
                example: parameterExample,
                exampleName: parameterExampleName
            });
        }
        if (Object.keys(v2Examples.userSpecifiedExamples).length === 0) {
            const exampleName = `${this.parameter.name}_example`;
            v2Examples.autogeneratedExamples[exampleName] = this.generateOrValidateExample({
                schema,
                example: undefined,
                ignoreErrors: true,
                exampleName
            });
        }
        return v2Examples;
    }

    private generateOrValidateExample({
        schema,
        ignoreErrors,
        example,
        exampleName
    }: {
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        example: unknown;
        ignoreErrors?: boolean;
        exampleName?: string;
    }): unknown {
        const exampleConverter = new ExampleConverter({
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            schema,
            example
        });
        const { validExample: convertedExample, errors } = exampleConverter.convert();
        if (!ignoreErrors) {
            const parameterContext = `${this.parameter.in} parameter "${this.parameter.name}"`;
            errors.forEach((error) => {
                const contextPrefix = exampleName
                    ? `Example "${exampleName}" for ${parameterContext}: `
                    : `Parameter ${parameterContext}: `;
                this.context.errorCollector.collect({
                    message: `${contextPrefix}${error.message}`,
                    path: error.path,
                    level: APIErrorLevel.WARNING
                });
            });
        }
        return convertedExample;
    }

    /**
     * Gets the explode value for a query parameter, applying smart default logic.
     * Only returns a value when it differs from the OpenAPI default for the style.
     *
     * OpenAPI defaults:
     * - form style (default for query): explode = true
     * - All other styles: explode = false
     */
    private getExplodeForQueryParameter(): boolean | undefined {
        const style = this.parameter.style ?? "form";
        const explode = this.parameter.explode;

        // If explode is not specified, return undefined (use default)
        if (explode === undefined) {
            return undefined;
        }

        // For form style, default explode is true
        // Only preserve explode if it differs from the default
        if (style === "form") {
            return explode === true ? undefined : explode;
        }

        // For all other styles (spaceDelimited, pipeDelimited, deepObject), default explode is false
        return explode === false ? undefined : explode;
    }

    /**
     * Gets the explode value for a path parameter, applying smart default logic.
     * Only returns a value when it differs from the OpenAPI default for the style.
     *
     * OpenAPI defaults:
     * - simple style (default for path): explode = false
     * - label style: explode = false
     * - matrix style: explode = false
     */
    private getExplodeForPathParameter(): boolean | undefined {
        const explode = this.parameter.explode;

        // If explode is not specified, return undefined (use default)
        if (explode === undefined) {
            return undefined;
        }

        // For path parameters, all styles (simple, label, matrix) have default explode = false
        // Only preserve explode if it differs from the default
        return explode === false ? undefined : explode;
    }
}
