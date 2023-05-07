import { HttpEndpoint, HttpHeader, HttpService, QueryParameter, SdkRequest } from "@fern-fern/ir-model/http";
import { getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
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

    public getParameterDeclaration(
        context: SdkClientClassContext,
        {
            typeIntersection,
            excludeInitializers = false,
        }: { typeIntersection?: ts.TypeNode; excludeInitializers?: boolean } = {}
    ): OptionalKind<ParameterDeclarationStructure> {
        const typeInfo = this.getParameterType(context);

        let type = typeInfo.type;
        if (typeIntersection != null) {
            type = ts.factory.createIntersectionTypeNode([type, typeIntersection]);
        }

        return {
            name: this.getRequestParameterName(),
            type: getTextOfTsNode(type),
            hasQuestionToken: typeInfo.hasQuestionToken,
            initializer:
                typeInfo.initializer != null && !excludeInitializers
                    ? getTextOfTsNode(typeInfo.initializer)
                    : undefined,
        };
    }

    protected getRequestParameterName(): string {
        return this.sdkRequest.requestParameterName.camelCase.unsafeName;
    }

    public abstract getInitialStatements(context: SdkClientClassContext): ts.Statement[];
    public abstract getAllQueryParameters(context: SdkClientClassContext): QueryParameter[];
    public abstract getReferenceToRequestBody(context: SdkClientClassContext): ts.Expression | undefined;
    public abstract getReferenceToQueryParameter(
        queryParameterKey: string,
        context: SdkClientClassContext
    ): ts.Expression;
    public abstract getReferenceToNonLiteralHeader(header: HttpHeader, context: SdkClientClassContext): ts.Expression;
    public abstract withQueryParameter(
        queryParameter: QueryParameter,
        context: SdkClientClassContext,
        callback: (value: ts.Expression) => ts.Statement[]
    ): ts.Statement[];
    protected abstract getParameterType(contxt: SdkClientClassContext): {
        type: ts.TypeNode;
        hasQuestionToken: boolean;
        initializer?: ts.Expression;
    };
}
