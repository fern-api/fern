import { GetReferenceOpts, PackageId, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import {
    ExampleEndpointCall,
    HttpEndpoint,
    HttpHeader,
    HttpService,
    QueryParameter,
    SdkRequest
} from "@fern-fern/ir-sdk/api";

import { RequestParameter } from "./RequestParameter";

export declare namespace AbstractRequestParameter {
    export interface Init {
        packageId: PackageId;
        service: HttpService;
        endpoint: HttpEndpoint;
        sdkRequest: SdkRequest;
    }
}

export abstract class AbstractRequestParameter implements RequestParameter {
    protected packageId: PackageId;
    protected service: HttpService;
    protected endpoint: HttpEndpoint;
    protected sdkRequest: SdkRequest;

    constructor({ packageId, service, endpoint, sdkRequest }: AbstractRequestParameter.Init) {
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
        this.sdkRequest = sdkRequest;
    }

    public getParameterDeclaration(context: SdkContext): OptionalKind<ParameterDeclarationStructure> {
        const typeInfo = this.getParameterType(context);

        return {
            name: this.getRequestParameterName(),
            type: getTextOfTsNode(typeInfo.type),
            hasQuestionToken: typeInfo.hasQuestionToken,
            initializer: typeInfo.initializer != null ? getTextOfTsNode(typeInfo.initializer) : undefined
        };
    }

    protected getRequestParameterName(): string {
        return this.sdkRequest.requestParameterName.camelCase.unsafeName;
    }

    public abstract getType(context: SdkContext): ts.TypeNode;
    public abstract getInitialStatements(context: SdkContext, args: { variablesInScope: string[] }): ts.Statement[];
    public abstract getAllQueryParameters(context: SdkContext): QueryParameter[];
    public abstract getReferenceToRequestBody(context: SdkContext): ts.Expression | undefined;
    public abstract getReferenceToPathParameter(pathParameterKey: string, context: SdkContext): ts.Expression;
    public abstract getReferenceToQueryParameter(queryParameterKey: string, context: SdkContext): ts.Expression;
    public abstract getReferenceToNonLiteralHeader(header: HttpHeader, context: SdkContext): ts.Expression;
    public abstract withQueryParameter(
        queryParameter: QueryParameter,
        context: SdkContext,
        queryParamSetter: (value: ts.Expression) => ts.Statement[],
        queryParamItemSetter: (value: ts.Expression) => ts.Statement[]
    ): ts.Statement[];
    public abstract generateExample({
        context,
        example,
        opts
    }: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression | undefined;
    protected abstract getParameterType(contxt: SdkContext): {
        type: ts.TypeNode;
        hasQuestionToken: boolean;
        initializer?: ts.Expression;
    };
    public abstract isOptional({ context }: { context: SdkContext }): boolean;
}
