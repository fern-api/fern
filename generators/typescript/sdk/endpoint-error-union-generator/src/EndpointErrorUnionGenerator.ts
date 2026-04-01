import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedEndpointErrorUnion } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";

import { GeneratedEndpointErrorUnionImpl } from "./GeneratedEndpointErrorUnionImpl.js";

export declare namespace EndpointErrorUnionGenerator {
    export interface Init {
        intermediateRepresentation: FernIr.IntermediateRepresentation;
        errorResolver: ErrorResolver;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        noOptionalProperties: boolean;
        enableInlineTypes: boolean;
        generateReadWriteOnlyTypes: boolean;
        caseConverter: CaseConverter;
    }

    export namespace generateEndpointErrorUnion {
        export interface Args {
            packageId: PackageId;
            endpoint: FernIr.HttpEndpoint;
        }
    }
}

export class EndpointErrorUnionGenerator {
    private readonly intermediateRepresentation: FernIr.IntermediateRepresentation;
    private readonly errorResolver: ErrorResolver;
    private readonly includeSerdeLayer: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly noOptionalProperties: boolean;
    private readonly enableInlineTypes: boolean;
    private readonly generateReadWriteOnlyTypes: boolean;
    private readonly caseConverter: CaseConverter;

    constructor({
        intermediateRepresentation,
        errorResolver,
        includeSerdeLayer,
        retainOriginalCasing,
        noOptionalProperties,
        enableInlineTypes,
        generateReadWriteOnlyTypes,
        caseConverter
    }: EndpointErrorUnionGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.noOptionalProperties = noOptionalProperties;
        this.enableInlineTypes = enableInlineTypes;
        this.generateReadWriteOnlyTypes = generateReadWriteOnlyTypes;
        this.caseConverter = caseConverter;
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
            generateReadWriteOnlyTypes: this.generateReadWriteOnlyTypes,
            caseConverter: this.caseConverter
        });
    }
}
