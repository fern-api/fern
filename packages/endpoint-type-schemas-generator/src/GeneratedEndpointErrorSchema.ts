import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { Zurg } from "@fern-typescript/commons-v2";
import { ErrorResolver } from "@fern-typescript/resolvers";
import {
    EndpointTypeSchemasContext,
    EndpointTypesContext,
    GeneratedUnion,
} from "@fern-typescript/sdk-declaration-handler";
import { GeneratedUnionSchema, RawNoPropertiesSingleUnionType } from "@fern-typescript/union-schema-generator";
import { ts } from "ts-morph";
import { RawSinglePropertyErrorSingleUnionType } from "./RawSinglePropertyErrorSingleUnionType";

export declare namespace GeneratedEndpointErrorSchema {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        errorResolver: ErrorResolver;
    }
}

export class GeneratedEndpointErrorSchema {
    private static ERROR_SCHEMA_NAME = "Error";

    private service: HttpService;
    private endpoint: HttpEndpoint;
    private generatedErrorUnionSchema: GeneratedUnionSchema<EndpointTypeSchemasContext>;

    constructor({ service, endpoint, errorResolver }: GeneratedEndpointErrorSchema.Init) {
        this.service = service;
        this.endpoint = endpoint;

        const discriminant = endpoint.errorsV2.discriminant;
        this.generatedErrorUnionSchema = new GeneratedUnionSchema<EndpointTypeSchemasContext>({
            typeName: GeneratedEndpointErrorSchema.ERROR_SCHEMA_NAME,
            shouldIncludeDefaultCaseInTransform: false,
            discriminant,
            getReferenceToSchema: (context) =>
                context.endpointTypeSchemas.getReferenceToEndpointTypeSchemaExport(
                    service.name,
                    endpoint.id,
                    GeneratedEndpointErrorSchema.ERROR_SCHEMA_NAME
                ),
            getGeneratedUnion: (context) => this.getErrorUnion(context),
            singleUnionTypes: endpoint.errors.map((responseError) => {
                const errorDeclaration = errorResolver.getErrorDeclarationFromName(responseError.error);
                if (errorDeclaration.typeV2 == null) {
                    return new RawNoPropertiesSingleUnionType({
                        discriminant,
                        discriminantValue: errorDeclaration.discriminantValue,
                    });
                } else {
                    return new RawSinglePropertyErrorSingleUnionType({
                        discriminant,
                        discriminantValue: errorDeclaration.discriminantValue,
                        errorName: responseError.error,
                    });
                }
            }),
        });
    }

    public writeToFile(context: EndpointTypeSchemasContext): void {
        this.generatedErrorUnionSchema.writeSchemaToFile(context);
    }

    public getReferenceToRawShape(context: EndpointTypeSchemasContext): ts.TypeNode {
        return this.generatedErrorUnionSchema.getReferenceToRawShape(context);
    }

    public getReferenceToZurgSchema(context: EndpointTypeSchemasContext): Zurg.Schema {
        return this.generatedErrorUnionSchema.getReferenceToZurgSchema(context);
    }

    private getErrorUnion(context: EndpointTypeSchemasContext): GeneratedUnion<EndpointTypesContext> {
        return context.endpointTypes.getGeneratedEndpointTypes(this.service.name, this.endpoint.id).getErrorUnion();
    }
}
