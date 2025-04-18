import { OpenAPIV3_1 } from "openapi-types";

import {
    ContainerType,
    HttpHeader,
    PathParameter,
    PrimitiveTypeV2,
    QueryParameter,
    TypeDeclaration,
    TypeId,
    TypeReference,
    V2SchemaExamples
} from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext } from "../..";
import { ExampleConverter } from "../ExampleConverter";

export declare namespace AbstractParameterConverter {
    export interface Args<TParameter extends OpenAPIV3_1.ParameterObject> extends AbstractConverter.AbstractArgs {
        parameter: TParameter;
    }

    export interface BaseParameterOutput {
        inlinedTypes?: Record<TypeId, TypeDeclaration>;
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
    public static STRING = TypeReference.primitive({
        v1: "STRING",
        v2: PrimitiveTypeV2.string({
            default: undefined,
            validation: undefined
        })
    });

    public static OPTIONAL_STRING = TypeReference.container(ContainerType.optional(AbstractParameterConverter.STRING));

    protected readonly parameter: TParameter;

    constructor({ context, breadcrumbs, parameter }: AbstractParameterConverter.Args<TParameter>) {
        super({ context, breadcrumbs });
        this.parameter = parameter;
    }

    public abstract convert(): Promise<AbstractParameterConverter.Output | undefined>;

    protected async convertToOutput({
        schema,
        typeReference,
        inlinedTypes
    }: {
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        typeReference: TypeReference | undefined;
        inlinedTypes: Record<TypeId, TypeDeclaration> | undefined;
    }): Promise<AbstractParameterConverter.Output | undefined> {
        const availability = await this.context.getAvailability({
            node: this.parameter,
            breadcrumbs: this.breadcrumbs
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
                        valueType: typeReference ?? AbstractParameterConverter.OPTIONAL_STRING,
                        allowMultiple: this.parameter.explode ?? false,
                        v2Examples: await this.convertParameterExamples({ schema }),
                        availability
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
                        valueType: typeReference ?? AbstractParameterConverter.OPTIONAL_STRING,
                        env: undefined,
                        v2Examples: await this.convertParameterExamples({ schema }),
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
                        valueType: typeReference ?? AbstractParameterConverter.STRING,
                        location: "ENDPOINT",
                        variable: undefined,
                        v2Examples: await this.convertParameterExamples({ schema })
                    },
                    inlinedTypes
                };
            default:
                return undefined;
        }
    }

    protected async convertParameterExamples({
        schema
    }: {
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    }): Promise<V2SchemaExamples> {
        const v2Examples: V2SchemaExamples = {
            userSpecifiedExamples: {},
            autogeneratedExamples: {}
        };

        const parameterExample = this.parameter.example;
        const parameterExamples = this.parameter.examples;

        for (const [key, example] of Object.entries(parameterExamples ?? {})) {
            const resolvedExample = await this.context.resolveExampleWithValue(example);
            if (resolvedExample != null) {
                v2Examples.userSpecifiedExamples[key] = await this.generateOrValidateExample({
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
            v2Examples.userSpecifiedExamples[parameterExampleName] = await this.generateOrValidateExample({
                schema,
                example: parameterExample
            });
        }
        if (Object.keys(v2Examples.userSpecifiedExamples).length === 0) {
            const exampleName = `${this.parameter.name}_example`;
            v2Examples.autogeneratedExamples[exampleName] = await this.generateOrValidateExample({
                schema,
                example: undefined,
                ignoreErrors: true
            });
        }
        return v2Examples;
    }

    private async generateOrValidateExample({
        schema,
        ignoreErrors,
        example
    }: {
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        example: unknown;
        ignoreErrors?: boolean;
    }): Promise<unknown> {
        const exampleConverter = new ExampleConverter({
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            schema,
            example
        });
        const { validExample: convertedExample, errors } = await exampleConverter.convert();
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
