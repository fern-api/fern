import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { GetReferenceOpts, getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import { RequestParameter } from "./RequestParameter.js";

export declare namespace AbstractRequestParameter {
    export interface Init {
        packageId: PackageId;
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
        sdkRequest: FernIr.SdkRequest;
        caseConverter: CaseConverter;
    }
}

export abstract class AbstractRequestParameter implements RequestParameter {
    protected packageId: PackageId;
    protected service: FernIr.HttpService;
    protected endpoint: FernIr.HttpEndpoint;
    protected sdkRequest: FernIr.SdkRequest;
    private readonly case: CaseConverter;

    constructor({ packageId, service, endpoint, sdkRequest, caseConverter }: AbstractRequestParameter.Init) {
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
        this.sdkRequest = sdkRequest;
        this.case = caseConverter;
    }

    public getParameterDeclaration(context: FileContext): OptionalKind<ParameterDeclarationStructure> {
        const typeInfo = this.getParameterType(context);

        return {
            name: this.getRequestParameterName(),
            type: getTextOfTsNode(typeInfo.type),
            hasQuestionToken: typeInfo.hasQuestionToken,
            initializer: typeInfo.initializer != null ? getTextOfTsNode(typeInfo.initializer) : undefined
        };
    }

    protected getRequestParameterName(): string {
        return this.case.camelUnsafe(this.sdkRequest.requestParameterName);
    }

    public abstract getType(context: FileContext): ts.TypeNode;
    public abstract getInitialStatements(context: FileContext, args: { variablesInScope: string[] }): ts.Statement[];
    public abstract getAllQueryParameters(context: FileContext): FernIr.QueryParameter[];
    public abstract getReferenceToRequestBody(context: FileContext): ts.Expression | undefined;
    public abstract getReferenceToPathParameter(pathParameterKey: string, context: FileContext): ts.Expression;
    public abstract getReferenceToQueryParameter(queryParameterKey: string, context: FileContext): ts.Expression;
    public abstract getReferenceToNonLiteralHeader(header: FernIr.HttpHeader, context: FileContext): ts.Expression;
    public abstract withQueryParameter(
        queryParameter: FernIr.QueryParameter,
        context: FileContext,
        queryParamSetter: (value: ts.Expression) => ts.Statement[],
        queryParamItemSetter: (value: ts.Expression) => ts.Statement[]
    ): ts.Statement[];
    public abstract generateExample({
        context,
        example,
        opts
    }: {
        context: FileContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression | undefined;
    protected abstract getParameterType(context: FileContext): {
        type: ts.TypeNode;
        hasQuestionToken: boolean;
        initializer?: ts.Expression;
    };
    public abstract isOptional({ context }: { context: FileContext }): boolean;
}
