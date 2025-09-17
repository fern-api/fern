import { HttpEndpoint, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedEndpointErrorUnion } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";

import { GeneratedEndpointErrorUnionImpl } from "./GeneratedEndpointErrorUnionImpl";

export declare namespace EndpointErrorUnionGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        errorResolver: ErrorResolver;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        noOptionalProperties: boolean;
        enableInlineTypes: boolean;
        generateReadWriteOnlyTypes: boolean;
    }

    export namespace generateEndpointErrorUnion {
        export interface Args {
            packageId: PackageId;
            endpoint: HttpEndpoint;
        }
    }
}

export class EndpointErrorUnionGenerator {
    private readonly intermediateRepresentation: IntermediateRepresentation;
    private readonly errorResolver: ErrorResolver;
    private readonly includeSerdeLayer: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly noOptionalProperties: boolean;
    private readonly enableInlineTypes: boolean;
    private readonly generateReadWriteOnlyTypes: boolean;

    constructor({
        intermediateRepresentation,
        errorResolver,
        includeSerdeLayer,
        retainOriginalCasing,
        noOptionalProperties,
        enableInlineTypes,
        generateReadWriteOnlyTypes
    }: EndpointErrorUnionGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.noOptionalProperties = noOptionalProperties;
        this.enableInlineTypes = enableInlineTypes;
        this.generateReadWriteOnlyTypes = generateReadWriteOnlyTypes;
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
            enableInlineTypes: this.enableInlineTypes,
            generateReadWriteOnlyTypes: this.generateReadWriteOnlyTypes
        });
    }
}
