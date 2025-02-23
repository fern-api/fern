import { ContainerType, HttpHeader, PathParameter, PrimitiveTypeV2, QueryParameter, TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";
import { SchemaConverter } from "../schema/SchemaConverter";

export declare namespace ParameterConverter {
    export interface Args extends AbstractConverter.Args {
        parameter: OpenAPIV3_1.ParameterObject;
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

export class ParameterConverter extends AbstractConverter<OpenAPIConverterContext3_1, ParameterConverter.Output> {

    private static STRING = TypeReference.primitive({
        v1: "STRING",
        v2: PrimitiveTypeV2.string({
            default: undefined,
            validation: undefined,
        })
    });
    
    private static OPTIONAL_STRING = TypeReference.container(
        ContainerType.optional(ParameterConverter.STRING)
    );

    private readonly parameter: OpenAPIV3_1.ParameterObject;

    constructor({ breadcrumbs, parameter }: ParameterConverter.Args) {
        super({ breadcrumbs });
        this.parameter = parameter;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): ParameterConverter.Output | undefined {
        let typeReference: TypeReference | undefined;
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};

        // Check if parameter schema is a reference first
        if (this.parameter.schema != null && context.isReferenceObject(this.parameter.schema)) {
            const maybeTypeReference = context.convertReferenceToTypeReference(this.parameter.schema);
            if (maybeTypeReference.ok) {
                typeReference = maybeTypeReference.reference;
            }
        } else if (this.parameter.schema != null) {
            const schemaId = this.parameter.name;
            const schemaConverter = new SchemaConverter({
                id: schemaId,
                breadcrumbs: [...this.breadcrumbs, "schema"],
                schema: this.parameter.schema
            });
            const convertedSchema = schemaConverter.convert({ context, errorCollector });
            if (convertedSchema != null) {
                typeReference = context.createNamedTypeReference(schemaId);
                inlinedTypes = {
                    ...convertedSchema.inlinedTypes,
                    [schemaId]: convertedSchema.typeDeclaration
                };
            }
        }

        switch (this.parameter.in) {
            case "query":
                return {
                    type: "query",
                    parameter: {
                        name: context.casingsGenerator.generateNameAndWireValue({ name: this.parameter.name, wireValue: this.parameter.name }),
                        docs: this.parameter.description,
                        valueType: typeReference ?? ParameterConverter.OPTIONAL_STRING, 
                        allowMultiple: this.parameter.explode ?? false,
                        availability: undefined
                    }
                };
            case "header":
                return {
                    type: "header", 
                    parameter: {
                        name: context.casingsGenerator.generateNameAndWireValue({ name: this.parameter.name, wireValue: this.parameter.name }),
                        docs: this.parameter.description,
                        valueType: typeReference ?? ParameterConverter.OPTIONAL_STRING, 
                        env: undefined,
                        availability: undefined,
                    }
                };
            case "path":
                return {
                    type: "path",
                    parameter: {
                        name: context.casingsGenerator.generateName(this.parameter.name),
                        docs: this.parameter.description,
                        valueType: typeReference ?? ParameterConverter.STRING, 
                        location: "ENDPOINT",
                        variable: undefined
                    }
                };
            default:
                return undefined;
        }
    }
}
