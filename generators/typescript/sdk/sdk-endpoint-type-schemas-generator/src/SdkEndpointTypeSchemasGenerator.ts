import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedSdkEndpointTypeSchemas } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";

import { GeneratedSdkEndpointTypeSchemasImpl } from "./GeneratedSdkEndpointTypeSchemasImpl.js";

export declare namespace SdkEndpointTypeSchemasGenerator {
    export interface Init {
        errorResolver: ErrorResolver;
        intermediateRepresentation: FernIr.IntermediateRepresentation;
        shouldGenerateErrors: boolean;
        skipResponseValidation: boolean;
        includeSerdeLayer: boolean;
        allowExtraFields: boolean;
        omitUndefined: boolean;
        caseConverter: CaseConverter;
    }

    export namespace generateEndpointTypeSchemas {
        export interface Args {
            packageId: PackageId;
            service: FernIr.HttpService;
            endpoint: FernIr.HttpEndpoint;
        }
    }
}

export class SdkEndpointTypeSchemasGenerator {
    private errorResolver: ErrorResolver;
    private intermediateRepresentation: FernIr.IntermediateRepresentation;
    private shouldGenerateErrors: boolean;
    private skipResponseValidation: boolean;
    private includeSerdeLayer: boolean;
    private allowExtraFields: boolean;
    private omitUndefined: boolean;
    private caseConverter: CaseConverter;

    constructor({
        errorResolver,
        intermediateRepresentation,
        shouldGenerateErrors,
        skipResponseValidation,
        includeSerdeLayer,
        allowExtraFields,
        omitUndefined,
        caseConverter
    }: SdkEndpointTypeSchemasGenerator.Init) {
        this.errorResolver = errorResolver;
        this.intermediateRepresentation = intermediateRepresentation;
        this.shouldGenerateErrors = shouldGenerateErrors;
        this.skipResponseValidation = skipResponseValidation;
        this.includeSerdeLayer = includeSerdeLayer;
        this.allowExtraFields = allowExtraFields;
        this.omitUndefined = omitUndefined;
        this.caseConverter = caseConverter;
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
            omitUndefined: this.omitUndefined,
            caseConverter: this.caseConverter
        });
    }
}
