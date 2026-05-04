import { FernIr } from "@fern-fern/ir-sdk";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { AbstractRequestParameter } from "./AbstractRequestParameter.js";

export declare namespace RequestBodyParameter {
    export interface Init extends AbstractRequestParameter.Init {
        requestBodyReference: FernIr.HttpRequestBodyReference;
    }
}

export class RequestBodyParameter extends AbstractRequestParameter {
    private requestBodyReference: FernIr.HttpRequestBodyReference;

    constructor({ requestBodyReference, ...superInit }: RequestBodyParameter.Init) {
        super(superInit);
        this.requestBodyReference = requestBodyReference;
    }

    public getType(context: FileContext): ts.TypeNode {
        const type = context.type.getReferenceToType(this.requestBodyReference.requestBodyType);
        return type.requestTypeNode ?? type.typeNode;
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

    public getAllQueryParameters(): FernIr.QueryParameter[] {
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

    public isOptional({ context }: { context: FileContext }): boolean {
        const type = context.type.getReferenceToType(this.requestBodyReference.requestBodyType);
        return type.isOptional;
    }

    public generateExample({
        context,
        example,
        opts
    }: {
        context: FileContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression | undefined {
        if (example.request == null || example.request.type !== "reference") {
            return undefined;
        }
        const generatedExample = context.type.getGeneratedExample(example.request);
        return generatedExample.build(context, opts);
    }

    protected getParameterType(context: FileContext): { type: ts.TypeNode; hasQuestionToken: boolean } {
        const type = context.type.getReferenceToType(this.requestBodyReference.requestBodyType);
        return {
            type: type.requestTypeNodeWithoutUndefined ?? type.typeNodeWithoutUndefined,
            hasQuestionToken: type.isOptional
        };
    }
}
