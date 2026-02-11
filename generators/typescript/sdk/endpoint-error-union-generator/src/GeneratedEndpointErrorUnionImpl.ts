import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedEndpointErrorUnion, GeneratedUnion, SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedUnionImpl } from "@fern-typescript/union-generator";

import { ParsedSingleUnionTypeForError } from "./error/ParsedSingleUnionTypeForError.js";
import { UnknownErrorSingleUnionType } from "./error/UnknownErrorSingleUnionType.js";
import { UnknownErrorSingleUnionTypeGenerator } from "./error/UnknownErrorSingleUnionTypeGenerator.js";

export declare namespace GeneratedEndpointErrorUnionImpl {
    export interface Init {
        packageId: PackageId;
        endpoint: FernIr.HttpEndpoint;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
        includeSerdeLayer: boolean;
        noOptionalProperties: boolean;
        retainOriginalCasing: boolean;
        enableInlineTypes: boolean;
        generateReadWriteOnlyTypes: boolean;
    }
}

export class GeneratedEndpointErrorUnionImpl implements GeneratedEndpointErrorUnion {
    private static ERROR_INTERFACE_NAME = "Error";
    private static STATUS_CODE_DISCRIMINANT = "statusCode";

    private endpoint: FernIr.HttpEndpoint;
    private errorUnion: GeneratedUnionImpl<SdkContext>;

    constructor({
        packageId,
        endpoint,
        errorResolver,
        errorDiscriminationStrategy,
        includeSerdeLayer,
        noOptionalProperties,
        retainOriginalCasing,
        enableInlineTypes,
        generateReadWriteOnlyTypes
    }: GeneratedEndpointErrorUnionImpl.Init) {
        this.endpoint = endpoint;

        const discriminant = this.getErrorUnionDiscriminant({
            errorDiscriminationStrategy,
            retainOriginalCasing
        });
        const unknownErrorSingleUnionTypeGenerator = new UnknownErrorSingleUnionTypeGenerator({ discriminant });
        const includeUtilsOnUnionMembers = includeSerdeLayer;
        this.errorUnion = new GeneratedUnionImpl<SdkContext>({
            shape: undefined,
            typeName: GeneratedEndpointErrorUnionImpl.ERROR_INTERFACE_NAME,
            includeUtilsOnUnionMembers,
            includeConstBuilders: true,
            discriminant,
            getDocs: undefined,
            parsedSingleUnionTypes: endpoint.errors.map(
                (error) =>
                    new ParsedSingleUnionTypeForError({
                        error,
                        errorResolver,
                        errorDiscriminationStrategy,
                        includeUtilsOnUnionMembers,
                        noOptionalProperties,
                        retainOriginalCasing,
                        enableInlineTypes,
                        generateReadWriteOnlyTypes
                    })
            ),
            getReferenceToUnion: (context) =>
                context.endpointErrorUnion.getReferenceToEndpointTypeExport(
                    packageId,
                    this.endpoint.name,
                    GeneratedEndpointErrorUnionImpl.ERROR_INTERFACE_NAME
                ),
            unknownSingleUnionType: new UnknownErrorSingleUnionType({
                singleUnionType: unknownErrorSingleUnionTypeGenerator,
                includeUtilsOnUnionMembers
            }),
            includeOtherInUnionTypes: true,
            includeSerdeLayer,
            noOptionalProperties,
            retainOriginalCasing,
            enableInlineTypes,
            // generate separate root types for errors in union
            inline: false,
            generateReadWriteOnlyTypes
        });
    }

    private getErrorUnionDiscriminant({
        errorDiscriminationStrategy,
        retainOriginalCasing
    }: {
        errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
        retainOriginalCasing: boolean;
    }): string {
        return FernIr.ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
            property: ({ discriminant }) =>
                retainOriginalCasing ? discriminant.name.originalName : discriminant.name.camelCase.unsafeName,
            statusCode: () => GeneratedEndpointErrorUnionImpl.STATUS_CODE_DISCRIMINANT,
            _other: () => {
                throw new Error("Unknown error discrimination strategy: " + errorDiscriminationStrategy.type);
            }
        });
    }

    public writeToFile(context: SdkContext): void {
        context.sourceFile.addStatements(this.errorUnion.generateStatements(context));
    }

    public getErrorUnion(): GeneratedUnion<SdkContext> {
        return this.errorUnion;
    }
}
