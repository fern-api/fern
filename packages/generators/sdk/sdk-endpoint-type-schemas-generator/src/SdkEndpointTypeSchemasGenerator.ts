import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { GeneratedSdkEndpointTypeSchemas } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedSdkEndpointTypeSchemasImpl } from "./GeneratedSdkEndpointTypeSchemasImpl";

export declare namespace SdkEndpointTypeSchemasGenerator {
    export interface Init {
        errorResolver: ErrorResolver;
        intermediateRepresentation: IntermediateRepresentation;
        shouldGenerateErrors: boolean;
    }

    export namespace generateEndpointTypeSchemas {
        export interface Args {
            service: HttpService;
            endpoint: HttpEndpoint;
        }
    }
}

export class SdkEndpointTypeSchemasGenerator {
    private errorResolver: ErrorResolver;
    private intermediateRepresentation: IntermediateRepresentation;
    private shouldGenerateErrors: boolean;

    constructor({
        errorResolver,
        intermediateRepresentation,
        shouldGenerateErrors,
    }: SdkEndpointTypeSchemasGenerator.Init) {
        this.errorResolver = errorResolver;
        this.intermediateRepresentation = intermediateRepresentation;
        this.shouldGenerateErrors = shouldGenerateErrors;
    }

    public generateEndpointTypeSchemas({
        service,
        endpoint,
    }: SdkEndpointTypeSchemasGenerator.generateEndpointTypeSchemas.Args): GeneratedSdkEndpointTypeSchemas {
        return new GeneratedSdkEndpointTypeSchemasImpl({
            service,
            endpoint,
            errorResolver: this.errorResolver,
            errorDiscriminationStrategy: this.intermediateRepresentation.errorDiscriminationStrategy,
            shouldGenerateErrors: this.shouldGenerateErrors,
        });
    }
}
