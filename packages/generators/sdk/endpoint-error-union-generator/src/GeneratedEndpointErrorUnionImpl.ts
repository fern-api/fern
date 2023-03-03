import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { EndpointErrorUnionContext, GeneratedEndpointErrorUnion, GeneratedUnion } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedUnionImpl } from "@fern-typescript/union-generator";
import { ParsedSingleUnionTypeForError } from "./error/ParsedSingleUnionTypeForError";
import { UnknownErrorSingleUnionType } from "./error/UnknownErrorSingleUnionType";
import { UnknownErrorSingleUnionTypeGenerator } from "./error/UnknownErrorSingleUnionTypeGenerator";

export declare namespace GeneratedEndpointErrorUnionImpl {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
        includeUtilsOnUnionMembers: boolean;
    }
}

export class GeneratedEndpointErrorUnionImpl implements GeneratedEndpointErrorUnion {
    private static ERROR_INTERFACE_NAME = "Error";
    private static STATUS_CODE_DISCRIMINANT = "statusCode";

    private endpoint: HttpEndpoint;
    private errorUnion: GeneratedUnionImpl<EndpointErrorUnionContext>;

    constructor({
        service,
        endpoint,
        errorResolver,
        errorDiscriminationStrategy,
    }: GeneratedEndpointErrorUnionImpl.Init) {
        this.endpoint = endpoint;

        const discriminant = this.getErrorUnionDiscriminant(errorDiscriminationStrategy);
        const unknownErrorSingleUnionTypeGenerator = new UnknownErrorSingleUnionTypeGenerator({ discriminant });
        this.errorUnion = new GeneratedUnionImpl<EndpointErrorUnionContext>({
            typeName: GeneratedEndpointErrorUnionImpl.ERROR_INTERFACE_NAME,
            includeUtilsOnUnionMembers: true,
            discriminant,
            getDocs: undefined,
            parsedSingleUnionTypes: endpoint.errors.map(
                (error) =>
                    new ParsedSingleUnionTypeForError({
                        error,
                        errorResolver,
                        errorDiscriminationStrategy,
                    })
            ),
            getReferenceToUnion: (context) =>
                context.endpointErrorUnion.getReferenceToEndpointTypeExport(
                    service.name,
                    this.endpoint.name,
                    GeneratedEndpointErrorUnionImpl.ERROR_INTERFACE_NAME
                ),
            unknownSingleUnionType: new UnknownErrorSingleUnionType({
                singleUnionType: unknownErrorSingleUnionTypeGenerator,
            }),
        });
    }

    private getErrorUnionDiscriminant(errorDiscriminationStrategy: ErrorDiscriminationStrategy): string {
        return ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
            property: ({ discriminant }) => discriminant.name.camelCase.unsafeName,
            statusCode: () => GeneratedEndpointErrorUnionImpl.STATUS_CODE_DISCRIMINANT,
            _unknown: () => {
                throw new Error("Unknown error discrimination strategy: " + errorDiscriminationStrategy.type);
            },
        });
    }

    public writeToFile(context: EndpointErrorUnionContext): void {
        this.errorUnion.writeToFile(context);
    }

    public getErrorUnion(): GeneratedUnion<EndpointErrorUnionContext> {
        return this.errorUnion;
    }
}
