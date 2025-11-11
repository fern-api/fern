import { HttpHeader, PathParameter, QueryParameter, TypeId, TypeReference, V2SchemaExamples } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext } from "../..";
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

        const style =
            this.parameter.style ??
            (this.parameter.in === "query" || this.parameter.in === "cookie" ? "form" : "simple");
        const defaultExplode = style === "form" || style === "deepObject";

        const explodeValue =
            this.parameter.explode !== undefined && this.parameter.explode !== defaultExplode
                ? this.parameter.explode
                : undefined;

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
                        explode: explodeValue
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
                        explode: explodeValue
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
                    example: resolvedExample
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
                example: parameterExample
            });
        }
        if (Object.keys(v2Examples.userSpecifiedExamples).length === 0) {
            const exampleName = `${this.parameter.name}_example`;
            v2Examples.autogeneratedExamples[exampleName] = this.generateOrValidateExample({
                schema,
                example: undefined,
                ignoreErrors: true
            });
        }
        return v2Examples;
    }

    private generateOrValidateExample({
        schema,
        ignoreErrors,
        example
    }: {
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        example: unknown;
        ignoreErrors?: boolean;
    }): unknown {
        const exampleConverter = new ExampleConverter({
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            schema,
            example
        });
        const { validExample: convertedExample, errors } = exampleConverter.convert();
        if (!ignoreErrors) {
            errors.forEach((error) => {
                this.context.errorCollector.collect({
                    message: error.message,
                    path: error.path
                });
            });
        }
        return convertedExample;
    }
}
