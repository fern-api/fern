import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { EndpointTypesContext, GeneratedEndpointTypes, GeneratedUnion } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedUnionImpl } from "@fern-typescript/union-generator";
import { ts } from "ts-morph";
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
    private static RESPONSE_INTERFACE_NAME = "Response";
    private static ERROR_INTERFACE_NAME = "Error";
    private static STATUS_CODE_DISCRIMINANT = "statusCode";

    private service: HttpService;
    private endpoint: HttpEndpoint;
    private errorUnion: GeneratedUnionImpl<EndpointTypesContext> | undefined;

    constructor({
        service,
        endpoint,
        errorResolver,
        errorDiscriminationStrategy,
        shouldGenerateErrors,
    }: GeneratedEndpointTypesImpl.Init) {
        this.service = service;
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
        this.writeResponseToFile(context);
        this.errorUnion?.writeToFile(context);
    }

    public getErrorUnion(): GeneratedUnion<EndpointTypesContext> {
        if (this.errorUnion == null) {
            throw new Error("Cannot get error union because error union is not defined.");
        }
        return this.errorUnion;
    }

    public getReferenceToResponseType(context: EndpointTypesContext): ts.TypeNode {
        return context.endpointTypes
            .getReferenceToEndpointTypeExport(
                this.service.name.fernFilepath,
                this.endpoint.name,
                GeneratedEndpointTypesImpl.RESPONSE_INTERFACE_NAME
            )
            .getTypeNode();
    }

    private writeResponseToFile(context: EndpointTypesContext): void {
        const responseType = this.getResponseType(context);
        if (responseType == null) {
            return undefined;
        }
        context.base.sourceFile.addTypeAlias({
            name: GeneratedEndpointTypesImpl.RESPONSE_INTERFACE_NAME,
            isExported: true,
            type: getTextOfTsNode(responseType),
        });
    }

    private getResponseType(context: EndpointTypesContext): ts.TypeNode | undefined {
        if (this.errorUnion != null) {
            return context.base.coreUtilities.fetcher.APIResponse._getReferenceToType(
                this.endpoint.response.type == null
                    ? ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                    : context.type.getReferenceToType(this.endpoint.response.type).typeNode,
                this.errorUnion.getReferenceTo(context)
            );
        }
        if (this.endpoint.response.type != null) {
            return context.type.getReferenceToType(this.endpoint.response.type).typeNode;
        }
        return undefined;
    }
}
