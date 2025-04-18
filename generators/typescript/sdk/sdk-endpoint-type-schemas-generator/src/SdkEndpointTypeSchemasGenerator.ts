import { PackageId } from "@fern-typescript/commons";
import { GeneratedSdkEndpointTypeSchemas } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";

import { HttpEndpoint, HttpService, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { GeneratedSdkEndpointTypeSchemasImpl } from "./GeneratedSdkEndpointTypeSchemasImpl";

export declare namespace SdkEndpointTypeSchemasGenerator {
    export interface Init {
        errorResolver: ErrorResolver;
        intermediateRepresentation: IntermediateRepresentation;
        shouldGenerateErrors: boolean;
        skipResponseValidation: boolean;
        includeSerdeLayer: boolean;
        allowExtraFields: boolean;
        omitUndefined: boolean;
    }

    export namespace generateEndpointTypeSchemas {
        export interface Args {
            packageId: PackageId;
            service: HttpService;
            endpoint: HttpEndpoint;
        }
    }
}

export class SdkEndpointTypeSchemasGenerator {
    private errorResolver: ErrorResolver;
    private intermediateRepresentation: IntermediateRepresentation;
    private shouldGenerateErrors: boolean;
    private skipResponseValidation: boolean;
    private includeSerdeLayer: boolean;
    private allowExtraFields: boolean;
    private omitUndefined: boolean;

    constructor({
        errorResolver,
        intermediateRepresentation,
        shouldGenerateErrors,
        skipResponseValidation,
        includeSerdeLayer,
        allowExtraFields,
        omitUndefined
    }: SdkEndpointTypeSchemasGenerator.Init) {
        this.errorResolver = errorResolver;
        this.intermediateRepresentation = intermediateRepresentation;
        this.shouldGenerateErrors = shouldGenerateErrors;
        this.skipResponseValidation = skipResponseValidation;
        this.includeSerdeLayer = includeSerdeLayer;
        this.allowExtraFields = allowExtraFields;
        this.omitUndefined = omitUndefined;
    }

    public generateEndpointTypeSchemas({
        packageId,
        service,
        endpoint
    }: SdkEndpointTypeSchemasGenerator.generateEndpointTypeSchemas.Args): GeneratedSdkEndpointTypeSchemas {
        return new GeneratedSdkEndpointTypeSchemasImpl({
            packageId,
            service,
            endpoint,
            errorResolver: this.errorResolver,
            errorDiscriminationStrategy: this.intermediateRepresentation.errorDiscriminationStrategy,
            shouldGenerateErrors: this.shouldGenerateErrors,
            skipResponseValidation: this.skipResponseValidation,
            includeSerdeLayer: this.includeSerdeLayer,
            allowExtraFields: this.allowExtraFields,
            omitUndefined: this.omitUndefined
        });
    }
}
