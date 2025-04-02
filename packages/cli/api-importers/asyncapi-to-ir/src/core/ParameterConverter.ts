import { OpenAPIV3_1 } from "openapi-types";

import {
    ContainerType,
    HttpHeader,
    PathParameter,
    PrimitiveTypeV2,
    QueryParameter,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-api/ir-sdk";
import { AbstractConverter, Converters, ErrorCollector, Extensions } from "@fern-api/v2-importer-commons";

import { AsyncAPIConverterContext } from "../AsyncAPIConverterContext";
import { AsyncAPIParameter } from "../sharedTypes";

export declare namespace ParameterConverter {
    export interface Args extends AbstractConverter.Args {
        parameter: AsyncAPIParameter;
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

export class ParameterConverter extends AbstractConverter<AsyncAPIConverterContext, ParameterConverter.Output> {
    public static STRING = TypeReference.primitive({
        v1: "STRING",
        v2: PrimitiveTypeV2.string({
            default: undefined,
            validation: undefined
        })
    });

    public static OPTIONAL_STRING = TypeReference.container(ContainerType.optional(ParameterConverter.STRING));

    private readonly parameter: AsyncAPIParameter;

    constructor({ breadcrumbs, parameter }: ParameterConverter.Args) {
        super({ breadcrumbs });
        this.parameter = parameter;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
    }): Promise<ParameterConverter.Output | undefined> {
        const fernOptionalExtension = new Extensions.FernOptionalExtension({
            breadcrumbs: this.breadcrumbs,
            parameter: this.parameter
        });
        const fernOptional = fernOptionalExtension.convert({ context, errorCollector });
        const parameterIsOptional = fernOptional ?? this.parameter.required ?? false;
        let maybeParameterSchema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined =
            this.parameter.schema;
        if (maybeParameterSchema == null) {
            maybeParameterSchema = {
                ...this.parameter,
                type: "string",
                enum: this.parameter.enum,
                default: this.parameter.default,
                example: this.parameter.examples?.[0],
                examples: undefined,
                required: undefined
            };
        }

        let typeReference: TypeReference | undefined;
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};
        const schemaOrReferenceConverter = new Converters.SchemaConverters.SchemaOrReferenceConverter({
            breadcrumbs: [...this.breadcrumbs, "schema"],
            schemaIdOverride: this.parameter.name,
            schemaOrReference: maybeParameterSchema,
            wrapAsOptional: parameterIsOptional
        });
        const converted = await schemaOrReferenceConverter.convert({ context, errorCollector });
        if (converted != null) {
            typeReference = converted.type;
            inlinedTypes = converted.inlinedTypes ?? {};
        }

        const availability = await context.getAvailability({
            node: this.parameter,
            breadcrumbs: this.breadcrumbs,
            errorCollector
        });

        switch (this.parameter.in) {
            case "query":
                return {
                    type: "query",
                    parameter: {
                        name: context.casingsGenerator.generateNameAndWireValue({
                            name: this.parameter.name,
                            wireValue: this.parameter.name
                        }),
                        docs: this.parameter.description,
                        valueType:
                            typeReference ??
                            (parameterIsOptional ? ParameterConverter.OPTIONAL_STRING : ParameterConverter.STRING),
                        allowMultiple: this.parameter.explode ?? false,
                        availability
                    },
                    inlinedTypes
                };
            case "header":
                return {
                    type: "header",
                    parameter: {
                        name: context.casingsGenerator.generateNameAndWireValue({
                            name: this.parameter.name,
                            wireValue: this.parameter.name
                        }),
                        docs: this.parameter.description,
                        valueType:
                            typeReference ??
                            (parameterIsOptional ? ParameterConverter.OPTIONAL_STRING : ParameterConverter.STRING),
                        env: undefined,
                        availability
                    },
                    inlinedTypes
                };
            case "path":
                return {
                    type: "path",
                    parameter: {
                        name: context.casingsGenerator.generateName(this.parameter.name),
                        docs: this.parameter.description,
                        valueType:
                            typeReference ??
                            (parameterIsOptional ? ParameterConverter.OPTIONAL_STRING : ParameterConverter.STRING),
                        location: "ENDPOINT",
                        variable: undefined
                    },
                    inlinedTypes
                };
            default:
                errorCollector.collect({
                    message: `Unsupported parameter location: ${this.parameter.in}`,
                    path: this.breadcrumbs
                });
                return undefined;
        }
    }
}
