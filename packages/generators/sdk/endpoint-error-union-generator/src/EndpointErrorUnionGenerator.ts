import { HttpEndpoint } from "@fern-fern/ir-model/http";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedEndpointErrorUnion } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedEndpointErrorUnionImpl } from "./GeneratedEndpointErrorUnionImpl";

export declare namespace EndpointErrorUnionGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        errorResolver: ErrorResolver;
        includeSerdeLayer: boolean;
        noOptionalProperties: boolean;
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
    private noOptionalProperties: boolean;

    constructor({
        intermediateRepresentation,
        errorResolver,
        includeSerdeLayer,
        noOptionalProperties,
    }: EndpointErrorUnionGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
        this.includeSerdeLayer = includeSerdeLayer;
        this.noOptionalProperties = noOptionalProperties;
    }

    public generateEndpointErrorUnion({
        packageId,
        endpoint,
    }: EndpointErrorUnionGenerator.generateEndpointErrorUnion.Args): GeneratedEndpointErrorUnion {
        return new GeneratedEndpointErrorUnionImpl({
            packageId,
            endpoint,
            errorResolver: this.errorResolver,
            errorDiscriminationStrategy: this.intermediateRepresentation.errorDiscriminationStrategy,
            includeSerdeLayer: this.includeSerdeLayer,
            noOptionalProperties: this.noOptionalProperties,
        });
    }
}
