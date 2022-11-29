import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { EndpointTypesContext, GeneratedEndpointTypes, GeneratedUnion } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedUnionImpl } from "@fern-typescript/union-generator";
import { ts } from "ts-morph";
import { ParsedSingleUnionTypeForError } from "./ParsedSingleUnionTypeForError";
import { GeneratedEndpointRequest } from "./request/GeneratedEndpointRequest";
import { NotWrappedEndpointRequest } from "./request/NotWrappedEndpointRequest";
import { WrappedEndpointRequest } from "./request/WrappedEndpointRequest";

export declare namespace GeneratedEndpointTypesImpl {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
    }
}

export class GeneratedEndpointTypesImpl implements GeneratedEndpointTypes {
    private static RESPONSE_INTERFACE_NAME = "Response";
    private static ERROR_INTERFACE_NAME = "Error";
    private static UNKNOWN_ERROR_PROPERTY_NAME = "content";

    private endpoint: HttpEndpoint;
    private request: GeneratedEndpointRequest;
    private errorUnion: GeneratedUnionImpl<EndpointTypesContext>;

    constructor({ service, endpoint }: GeneratedEndpointTypesImpl.Init) {
        this.endpoint = endpoint;

        this.request = isRequestWrapped(service, endpoint)
            ? new WrappedEndpointRequest({ service, endpoint })
            : new NotWrappedEndpointRequest({ service, endpoint });

        this.errorUnion = new GeneratedUnionImpl({
            typeName: GeneratedEndpointTypesImpl.ERROR_INTERFACE_NAME,
            discriminant: endpoint.errorsV2.discriminant,
            docs: undefined,
            parsedSingleUnionTypes: endpoint.errorsV2.types.map(
                (error) => new ParsedSingleUnionTypeForError({ errors: endpoint.errorsV2, error })
            ),
            getReferenceToUnion: (context) =>
                context.getReferenceToExportFromThisFile(GeneratedEndpointTypesImpl.ERROR_INTERFACE_NAME),
            unknownSingleUnionType: {
                discriminantType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
                getVisitorArgument: (file) => file.coreUtilities.fetcher.Fetcher.Error._getReferenceToType(),
                getNonDiscriminantProperties: (file) => [
                    {
                        name: GeneratedEndpointTypesImpl.UNKNOWN_ERROR_PROPERTY_NAME,
                        type: getTextOfTsNode(file.coreUtilities.fetcher.Fetcher.Error._getReferenceToType()),
                    },
                ],
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

    private writeResponseToFile(context: EndpointTypesContext): void {
        context.sourceFile.addTypeAlias({
            name: GeneratedEndpointTypesImpl.RESPONSE_INTERFACE_NAME,
            isExported: true,
            type: getTextOfTsNode(
                context.coreUtilities.fetcher.APIResponse._getReferenceToType(
                    this.endpoint.response.typeV2 == null
                        ? ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                        : context.getReferenceToType(this.endpoint.response.typeV2).typeNode,
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
