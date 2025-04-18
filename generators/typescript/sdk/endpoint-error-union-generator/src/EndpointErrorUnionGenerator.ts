import { PackageId } from "@fern-typescript/commons";
import { GeneratedEndpointErrorUnion } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";

import { HttpEndpoint, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { GeneratedEndpointErrorUnionImpl } from "./GeneratedEndpointErrorUnionImpl";

export declare namespace EndpointErrorUnionGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        errorResolver: ErrorResolver;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        noOptionalProperties: boolean;
        enableInlineTypes: boolean;
    }

    export namespace generateEndpointErrorUnion {
        export interface Args {
            packageId: PackageId;
            endpoint: HttpEndpoint;
        }
    }
}

export class EndpointErrorUnionGenerator {
    private intermediateRepresentation: IntermediateRepresentation;
    private errorResolver: ErrorResolver;
    private includeSerdeLayer: boolean;
    private retainOriginalCasing: boolean;
    private noOptionalProperties: boolean;
    private enableInlineTypes: boolean;

    constructor({
        intermediateRepresentation,
        errorResolver,
        includeSerdeLayer,
        retainOriginalCasing,
        noOptionalProperties,
        enableInlineTypes
    }: EndpointErrorUnionGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.noOptionalProperties = noOptionalProperties;
        this.enableInlineTypes = enableInlineTypes;
    }

    public generateEndpointErrorUnion({
        packageId,
        endpoint
    }: EndpointErrorUnionGenerator.generateEndpointErrorUnion.Args): GeneratedEndpointErrorUnion {
        return new GeneratedEndpointErrorUnionImpl({
            packageId,
            endpoint,
            errorResolver: this.errorResolver,
            errorDiscriminationStrategy: this.intermediateRepresentation.errorDiscriminationStrategy,
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            noOptionalProperties: this.noOptionalProperties,
            enableInlineTypes: this.enableInlineTypes
        });
    }
}
