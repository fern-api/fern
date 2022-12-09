import { ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { HttpEndpoint, HttpHeader, HttpService, QueryParameter } from "@fern-fern/ir-model/services/http";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { EndpointTypesContext, GeneratedEndpointTypes, GeneratedUnion } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedUnionImpl } from "@fern-typescript/union-generator";
import { ts } from "ts-morph";
import { ParsedSingleUnionTypeForError } from "./error/ParsedSingleUnionTypeForError";
import { UnknownErrorSingleUnionType } from "./error/UnknownErrorSingleUnionType";
import { UnknownErrorSingleUnionTypeGenerator } from "./error/UnknownErrorSingleUnionTypeGenerator";
import { GeneratedEndpointRequest } from "./request/GeneratedEndpointRequest";
import { NotWrappedEndpointRequest } from "./request/NotWrappedEndpointRequest";
import { WrappedEndpointRequest } from "./request/WrappedEndpointRequest";

export declare namespace GeneratedEndpointTypesImpl {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    }
}

export class GeneratedEndpointTypesImpl implements GeneratedEndpointTypes {
    private static RESPONSE_INTERFACE_NAME = "Response";
    private static ERROR_INTERFACE_NAME = "Error";
    private static STATUS_CODE_DISCRIMINANT = "statusCode";

    private service: HttpService;
    private endpoint: HttpEndpoint;
    private request: GeneratedEndpointRequest;
    private errorUnion: GeneratedUnionImpl<EndpointTypesContext>;

    constructor({ service, endpoint, errorResolver, errorDiscriminationStrategy }: GeneratedEndpointTypesImpl.Init) {
        this.service = service;
        this.endpoint = endpoint;

        this.request = isRequestWrapped(service, endpoint)
            ? new WrappedEndpointRequest({ service, endpoint })
            : new NotWrappedEndpointRequest({ service, endpoint });

        const unknownErrorSingleUnionTypeGenerator = new UnknownErrorSingleUnionTypeGenerator();
        this.errorUnion = new GeneratedUnionImpl<EndpointTypesContext>({
            typeName: GeneratedEndpointTypesImpl.ERROR_INTERFACE_NAME,
            discriminant: this.getErrorUnionDiscriminant(errorDiscriminationStrategy),
            getDocs: undefined,
            parsedSingleUnionTypes: endpoint.errors.map(
                (error) => new ParsedSingleUnionTypeForError({ error, errorResolver, errorDiscriminationStrategy })
            ),
            getReferenceToUnion: (context) =>
                context.endpointTypes.getReferenceToEndpointTypeExport(
                    service.name,
                    this.endpoint.id,
                    GeneratedEndpointTypesImpl.ERROR_INTERFACE_NAME
                ),
            unknownSingleUnionType: new UnknownErrorSingleUnionType({
                singleUnionType: unknownErrorSingleUnionTypeGenerator,
                builderParameterName: unknownErrorSingleUnionTypeGenerator.getBuilderParameterName(),
            }),
        });
    }

    private getErrorUnionDiscriminant(errorDiscriminationStrategy: ErrorDiscriminationStrategy): string {
        return ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
            property: ({ discriminant }) => discriminant.name.unsafeName.camelCase,
            statusCode: () => GeneratedEndpointTypesImpl.STATUS_CODE_DISCRIMINANT,
            _unknown: () => {
                throw new Error("Unknown error discrimination strategy: " + errorDiscriminationStrategy.type);
            },
        });
    }

    public writeToFile(context: EndpointTypesContext): void {
        this.request.writeToFile(context);
        this.writeResponseToFile(context);
        this.errorUnion.writeToFile(context);
    }

    public getErrorUnion(): GeneratedUnion<EndpointTypesContext> {
        return this.errorUnion;
    }

    public getReferenceToRequestType(context: EndpointTypesContext): TypeReferenceNode | undefined {
        return this.request.getRequestParameterType(context);
    }

    public getReferenceToResponseType(context: EndpointTypesContext): ts.TypeNode {
        return context.endpointTypes
            .getReferenceToEndpointTypeExport(
                this.service.name,
                this.endpoint.id,
                GeneratedEndpointTypesImpl.RESPONSE_INTERFACE_NAME
            )
            .getTypeNode();
    }

    public getReferenceToRequestBody(requestParameter: ts.Expression): ts.Expression {
        return this.request.getReferenceToRequestBody(requestParameter);
    }

    public getReferenceToQueryParameter(
        queryParameter: QueryParameter,
        requestParameter: ts.Expression
    ): ts.Expression {
        return this.request.getReferenceToQueryParameter(queryParameter, requestParameter);
    }

    public getReferenceToPathParameter(pathParameterKey: string, requestParameter: ts.Expression): ts.Expression {
        return this.request.getReferenceToPathParameter(pathParameterKey, requestParameter);
    }

    public getReferenceToHeader(header: HttpHeader, requestParameter: ts.Expression): ts.Expression {
        return this.request.getReferenceToHeader(header, requestParameter);
    }

    private writeResponseToFile(context: EndpointTypesContext): void {
        context.base.sourceFile.addTypeAlias({
            name: GeneratedEndpointTypesImpl.RESPONSE_INTERFACE_NAME,
            isExported: true,
            type: getTextOfTsNode(
                context.base.coreUtilities.fetcher.APIResponse._getReferenceToType(
                    this.endpoint.response.typeV2 == null
                        ? ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                        : context.type.getReferenceToType(this.endpoint.response.typeV2).typeNode,
                    this.errorUnion.getReferenceTo(context)
                )
            ),
        });
    }
}

function isRequestWrapped(service: HttpService, endpoint: HttpEndpoint): boolean {
    return (
        service.pathParameters.length > 0 ||
        endpoint.pathParameters.length > 0 ||
        endpoint.queryParameters.length > 0 ||
        endpoint.headers.length > 0
    );
}
