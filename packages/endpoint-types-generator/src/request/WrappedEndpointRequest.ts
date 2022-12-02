import { HttpHeader, PathParameter, QueryParameter } from "@fern-fern/ir-model/services/http";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { EndpointTypesContext } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { AbstractEndpointRequest } from "./AbstractEndpointRequest";
import { GeneratedEndpointRequest } from "./GeneratedEndpointRequest";

export declare namespace WrappedEndpointRequest {
    export interface Init extends AbstractEndpointRequest.Init {}
}

export class WrappedEndpointRequest extends AbstractEndpointRequest implements GeneratedEndpointRequest {
    private static REQUEST_WRAPPER_INTERFACE_NAME = "Request";
    private static REQUEST_BODY_PROPERTY_NAME = "_body";

    public writeToFile(context: EndpointTypesContext): void {
        const properties: OptionalKind<PropertySignatureStructure>[] = [];

        for (const queryParameter of this.endpoint.queryParameters) {
            const type = context.type.getReferenceToType(queryParameter.valueType);
            properties.push({
                name: this.getQueryParameterKeyInWrapper(queryParameter),
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
                docs: queryParameter.docs != null ? [queryParameter.docs] : undefined,
            });
        }

        for (const pathParameter of this.getAllPathParameters()) {
            const type = context.type.getReferenceToType(pathParameter.valueType);
            properties.push({
                name: this.getPathParameterKeyInWrapper(pathParameter),
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
                docs: pathParameter.docs != null ? [pathParameter.docs] : undefined,
            });
        }

        for (const header of this.getAllHeaders()) {
            const type = context.type.getReferenceToType(header.valueType);
            properties.push({
                name: this.getHeaderKeyInWrapper(header),
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
                docs: header.docs != null ? [header.docs] : undefined,
            });
        }

        if (this.endpoint.request.typeV2 != null) {
            const type = context.type.getReferenceToType(this.endpoint.request.typeV2);
            properties.push({
                name: WrappedEndpointRequest.REQUEST_BODY_PROPERTY_NAME,
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
            });
        }

        context.base.sourceFile.addInterface({
            name: WrappedEndpointRequest.REQUEST_WRAPPER_INTERFACE_NAME,
            isExported: true,
            properties,
        });
    }

    public getRequestParameterType(context: EndpointTypesContext): TypeReferenceNode {
        const typeNode = context.endpointTypes
            .getReferenceToEndpointTypeExport(
                this.service.name,
                this.endpoint.id,
                WrappedEndpointRequest.REQUEST_WRAPPER_INTERFACE_NAME
            )
            .getTypeNode();
        return {
            isOptional: false,
            typeNode,
            typeNodeWithoutUndefined: typeNode,
        };
    }

    public getReferenceToRequestBody(requestParameter: ts.Expression): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            requestParameter,
            WrappedEndpointRequest.REQUEST_BODY_PROPERTY_NAME
        );
    }

    public getReferenceToQueryParameter(
        queryParameter: QueryParameter,
        requestParameter: ts.Expression
    ): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            requestParameter,
            this.getQueryParameterKeyInWrapper(queryParameter)
        );
    }

    public getReferenceToPathParameter(pathParameterKey: string, requestParameter: ts.Expression): ts.Expression {
        const pathParameter = this.getAllPathParameters().find(
            (pathParameter) => pathParameter.nameV2.unsafeName.originalValue === pathParameterKey
        );
        if (pathParameter == null) {
            throw new Error("Cannot find path parameter " + pathParameterKey);
        }
        return ts.factory.createPropertyAccessExpression(
            requestParameter,
            this.getPathParameterKeyInWrapper(pathParameter)
        );
    }

    public getReferenceToHeader(header: HttpHeader, requestParameter: ts.Expression): ts.Expression {
        return ts.factory.createPropertyAccessExpression(requestParameter, this.getHeaderKeyInWrapper(header));
    }

    private getQueryParameterKeyInWrapper(queryParameter: QueryParameter): string {
        return queryParameter.name.camelCase;
    }

    private getPathParameterKeyInWrapper(pathParameter: PathParameter): string {
        return pathParameter.name.camelCase;
    }

    private getAllPathParameters(): PathParameter[] {
        return [...this.service.pathParameters, ...this.endpoint.pathParameters];
    }

    private getHeaderKeyInWrapper(header: HttpHeader): string {
        return header.name.camelCase;
    }

    private getAllHeaders(): HttpHeader[] {
        return [...this.service.headers, ...this.endpoint.headers];
    }
}
