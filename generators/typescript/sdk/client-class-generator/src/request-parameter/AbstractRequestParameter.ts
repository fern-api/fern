import { FernIr } from "@fern-fern/ir-sdk";
import { GetReferenceOpts, getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import { RequestParameter } from "./RequestParameter.js";

export declare namespace AbstractRequestParameter {
    export interface Init {
        packageId: PackageId;
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
        sdkRequest: FernIr.SdkRequest;
    }
}

export abstract class AbstractRequestParameter implements RequestParameter {
    protected packageId: PackageId;
    protected service: FernIr.HttpService;
    protected endpoint: FernIr.HttpEndpoint;
    protected sdkRequest: FernIr.SdkRequest;

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
    public abstract getAllQueryParameters(context: SdkContext): FernIr.QueryParameter[];
    public abstract getReferenceToRequestBody(context: SdkContext): ts.Expression | undefined;
    public abstract getReferenceToPathParameter(pathParameterKey: string, context: SdkContext): ts.Expression;
    public abstract getReferenceToQueryParameter(queryParameterKey: string, context: SdkContext): ts.Expression;
    public abstract getReferenceToNonLiteralHeader(header: FernIr.HttpHeader, context: SdkContext): ts.Expression;
    public abstract withQueryParameter(
        queryParameter: FernIr.QueryParameter,
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
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression | undefined;
    protected abstract getParameterType(context: SdkContext): {
        type: ts.TypeNode;
        hasQuestionToken: boolean;
        initializer?: ts.Expression;
    };
    public abstract isOptional({ context }: { context: SdkContext }): boolean;
}
