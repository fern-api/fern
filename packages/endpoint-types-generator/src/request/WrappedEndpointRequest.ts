import { HttpHeader, PathParameter, QueryParameter } from "@fern-fern/ir-model/services/http";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { EndpointTypesContext } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure } from "ts-morph";
import { AbstractEndpointRequest } from "./AbstractEndpointRequest";
import { GeneratedEndpointRequest } from "./GeneratedEndpointRequest";

interface ParsedQueryParam {
    keyInWrapper: string;
    queryParameter: QueryParameter;
}

interface ParsedPathParam {
    keyInWrapper: string;
    pathParameter: PathParameter;
}

interface ParsedHeader {
    keyInWrapper: string;
    header: HttpHeader;
}

export declare namespace WrappedEndpointRequest {
    export interface Init extends AbstractEndpointRequest.Init {}
}

export class WrappedEndpointRequest extends AbstractEndpointRequest implements GeneratedEndpointRequest {
    private static REQUEST_WRAPPER_INTERFACE_NAME = "Request";
    private static REQUEST_BODY_PROPERTY_NAME = "_body";

    private parsedQueryParameters: ParsedQueryParam[] = [];
    private parsedPathParameters: ParsedPathParam[] = [];
    private parsedHeaders: ParsedHeader[] = [];

    constructor(superInit: AbstractEndpointRequest.Init) {
        super(superInit);

        this.parsedQueryParameters = this.endpoint.queryParameters.map((queryParameter) => ({
            keyInWrapper: queryParameter.name.camelCase,
            queryParameter,
        }));
        this.parsedPathParameters = [...this.service.pathParameters, ...this.endpoint.pathParameters].map(
            (pathParameter) => ({
                keyInWrapper: pathParameter.name.camelCase,
                pathParameter,
            })
        );
        this.parsedHeaders = [...this.service.headers, ...this.endpoint.headers].map((header) => ({
            keyInWrapper: header.name.camelCase,
            header,
        }));
    }

    public writeToFile(context: EndpointTypesContext): void {
        const properties: OptionalKind<PropertySignatureStructure>[] = [];

        for (const { keyInWrapper, queryParameter } of this.parsedQueryParameters) {
            const type = context.getReferenceToType(queryParameter.valueType);
            properties.push({
                name: keyInWrapper,
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
                docs: queryParameter.docs != null ? [queryParameter.docs] : undefined,
            });
        }

        for (const { keyInWrapper, pathParameter } of this.parsedPathParameters) {
            const type = context.getReferenceToType(pathParameter.valueType);
            properties.push({
                name: keyInWrapper,
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
                docs: pathParameter.docs != null ? [pathParameter.docs] : undefined,
            });
        }

        for (const { keyInWrapper, header } of this.parsedHeaders) {
            const type = context.getReferenceToType(header.valueType);
            properties.push({
                name: keyInWrapper,
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
                docs: header.docs != null ? [header.docs] : undefined,
            });
        }

        if (this.endpoint.request.typeV2 != null) {
            const type = context.getReferenceToType(this.endpoint.request.typeV2);
            properties.push({
                name: WrappedEndpointRequest.REQUEST_BODY_PROPERTY_NAME,
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
            });
        }

        context.sourceFile.addInterface({
            name: WrappedEndpointRequest.REQUEST_WRAPPER_INTERFACE_NAME,
            isExported: true,
            properties,
        });
    }

    public getRequestParameterType(context: EndpointTypesContext): TypeReferenceNode {
        const typeNode = context
            .getReferenceToExportFromThisFile(WrappedEndpointRequest.REQUEST_WRAPPER_INTERFACE_NAME)
            .getTypeNode();
        return {
            isOptional: false,
            typeNode,
            typeNodeWithoutUndefined: typeNode,
        };
    }
}
