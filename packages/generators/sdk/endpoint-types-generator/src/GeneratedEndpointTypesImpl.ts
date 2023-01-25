import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { EndpointTypesContext, GeneratedEndpointTypes, GeneratedUnion } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedUnionImpl } from "@fern-typescript/union-generator";
import { ParsedSingleUnionTypeForError } from "./error/ParsedSingleUnionTypeForError";
import { UnknownErrorSingleUnionType } from "./error/UnknownErrorSingleUnionType";
import { UnknownErrorSingleUnionTypeGenerator } from "./error/UnknownErrorSingleUnionTypeGenerator";

export declare namespace GeneratedEndpointTypesImpl {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
        shouldGenerateErrors: boolean;
    }
}

export class GeneratedEndpointTypesImpl implements GeneratedEndpointTypes {
    private static ERROR_INTERFACE_NAME = "Error";
    private static STATUS_CODE_DISCRIMINANT = "statusCode";

    private endpoint: HttpEndpoint;
    private errorUnion: GeneratedUnionImpl<EndpointTypesContext> | undefined;

    constructor({
        service,
        endpoint,
        errorResolver,
        errorDiscriminationStrategy,
        shouldGenerateErrors,
    }: GeneratedEndpointTypesImpl.Init) {
        this.endpoint = endpoint;

        const discriminant = this.getErrorUnionDiscriminant(errorDiscriminationStrategy);
        const unknownErrorSingleUnionTypeGenerator = new UnknownErrorSingleUnionTypeGenerator({ discriminant });
        this.errorUnion = shouldGenerateErrors
            ? new GeneratedUnionImpl<EndpointTypesContext>({
                  typeName: GeneratedEndpointTypesImpl.ERROR_INTERFACE_NAME,
                  discriminant,
                  getDocs: undefined,
                  parsedSingleUnionTypes: endpoint.errors.map(
                      (error) =>
                          new ParsedSingleUnionTypeForError({ error, errorResolver, errorDiscriminationStrategy })
                  ),
                  getReferenceToUnion: (context) =>
                      context.endpointTypes.getReferenceToEndpointTypeExport(
                          service.name.fernFilepath,
                          this.endpoint.name,
                          GeneratedEndpointTypesImpl.ERROR_INTERFACE_NAME
                      ),
                  unknownSingleUnionType: new UnknownErrorSingleUnionType({
                      singleUnionType: unknownErrorSingleUnionTypeGenerator,
                  }),
              })
            : undefined;
    }

    private getErrorUnionDiscriminant(errorDiscriminationStrategy: ErrorDiscriminationStrategy): string {
        return ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
            property: ({ discriminant }) => discriminant.name.camelCase.unsafeName,
            statusCode: () => GeneratedEndpointTypesImpl.STATUS_CODE_DISCRIMINANT,
            _unknown: () => {
                throw new Error("Unknown error discrimination strategy: " + errorDiscriminationStrategy.type);
            },
        });
    }

    public writeToFile(context: EndpointTypesContext): void {
        this.errorUnion?.writeToFile(context);
    }

    public getErrorUnion(): GeneratedUnion<EndpointTypesContext> {
        if (this.errorUnion == null) {
            throw new Error("Cannot get error union because error union is not defined.");
        }
        return this.errorUnion;
    }
}
