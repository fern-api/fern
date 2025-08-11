import { GetReferenceOpts } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { ExampleEndpointCall, HttpRequestBodyReference, QueryParameter } from "@fern-fern/ir-sdk/api";

import { AbstractRequestParameter } from "./AbstractRequestParameter";

export declare namespace RequestBodyParameter {
    export interface Init extends AbstractRequestParameter.Init {
        requestBodyReference: HttpRequestBodyReference;
    }
}

export class RequestBodyParameter extends AbstractRequestParameter {
    private requestBodyReference: HttpRequestBodyReference;

    constructor({ requestBodyReference, ...superInit }: RequestBodyParameter.Init) {
        super(superInit);
        this.requestBodyReference = requestBodyReference;
    }

    public getType(context: SdkContext): ts.TypeNode {
        return context.type.getReferenceToType(this.requestBodyReference.requestBodyType).typeNode;
    }

    public getInitialStatements(): ts.Statement[] {
        return [];
    }

    public getReferenceToRequestBody(): ts.Expression {
        return ts.factory.createIdentifier(this.getRequestParameterName());
    }

    public getReferenceToNonLiteralHeader(): ts.Expression {
        throw new Error("Cannot get reference to header because request is not wrapped");
    }

    public getAllQueryParameters(): QueryParameter[] {
        return [];
    }

    public withQueryParameter(): never {
        throw new Error("Cannot reference query parameter because request is not wrapped");
    }

    public getReferenceToPathParameter(): ts.Expression {
        throw new Error("Cannot reference path parameter because request is not wrapped");
    }

    public getReferenceToQueryParameter(): ts.Expression {
        throw new Error("Cannot reference query parameter because request is not wrapped");
    }

    public isOptional({ context }: { context: SdkContext }): boolean {
        const type = context.type.getReferenceToType(this.requestBodyReference.requestBodyType);
        return type.isOptional;
    }

    public generateExample({
        context,
        example,
        opts
    }: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression | undefined {
        if (example.request == null || example.request.type !== "reference") {
            return undefined;
        }
        const generatedExample = context.type.getGeneratedExample(example.request);
        return generatedExample.build(context, opts);
    }

    protected getParameterType(context: SdkContext): { type: ts.TypeNode; hasQuestionToken: boolean } {
        const type = context.type.getReferenceToType(this.requestBodyReference.requestBodyType);
        return {
            type: type.typeNodeWithoutUndefined,
            hasQuestionToken: type.isOptional
        };
    }
}
