import { ErrorDiscriminationStrategy, HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedEndpointErrorUnion, GeneratedUnion, SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedUnionImpl } from "@fern-typescript/union-generator";
import { ParsedSingleUnionTypeForError } from "./error/ParsedSingleUnionTypeForError";
import { UnknownErrorSingleUnionType } from "./error/UnknownErrorSingleUnionType";
import { UnknownErrorSingleUnionTypeGenerator } from "./error/UnknownErrorSingleUnionTypeGenerator";

export declare namespace GeneratedEndpointErrorUnionImpl {
    export interface Init {
        packageId: PackageId;
        endpoint: HttpEndpoint;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
        includeSerdeLayer: boolean;
        noOptionalProperties: boolean;
    }
}

export class GeneratedEndpointErrorUnionImpl implements GeneratedEndpointErrorUnion {
    private static ERROR_INTERFACE_NAME = "Error";
    private static STATUS_CODE_DISCRIMINANT = "statusCode";

    private endpoint: HttpEndpoint;
    private errorUnion: GeneratedUnionImpl<SdkContext>;

    constructor({
        packageId,
        endpoint,
        errorResolver,
        errorDiscriminationStrategy,
        includeSerdeLayer,
        noOptionalProperties,
    }: GeneratedEndpointErrorUnionImpl.Init) {
        this.endpoint = endpoint;

        const discriminant = this.getErrorUnionDiscriminant(errorDiscriminationStrategy);
        const unknownErrorSingleUnionTypeGenerator = new UnknownErrorSingleUnionTypeGenerator({ discriminant });
        const includeUtilsOnUnionMembers = includeSerdeLayer;
        this.errorUnion = new GeneratedUnionImpl<SdkContext>({
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
                includeUtilsOnUnionMembers,
            }),
            includeOtherInUnionTypes: true,
            includeSerdeLayer,
            noOptionalProperties,
        });
    }

    private getErrorUnionDiscriminant(errorDiscriminationStrategy: ErrorDiscriminationStrategy): string {
        return ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
            property: ({ discriminant }) => discriminant.name.camelCase.unsafeName,
            statusCode: () => GeneratedEndpointErrorUnionImpl.STATUS_CODE_DISCRIMINANT,
            _other: () => {
                throw new Error("Unknown error discrimination strategy: " + errorDiscriminationStrategy.type);
            },
        });
    }

    public writeToFile(context: SdkContext): void {
        this.errorUnion.writeToFile(context);
    }

    public getErrorUnion(): GeneratedUnion<SdkContext> {
        return this.errorUnion;
    }
}
