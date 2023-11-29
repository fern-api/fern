import { HttpRequestBodyReference, QueryParameter } from "@fern-fern/ir-sdk/api";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
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

    public getReferenceToQueryParameter(): ts.Expression {
        throw new Error("Cannot reference query parameter because request is not wrapped");
    }

    public generateExample(): ts.Expression | undefined {
        return undefined;
    }

    protected getParameterType(context: SdkContext): { type: ts.TypeNode; hasQuestionToken: boolean } {
        const type = context.type.getReferenceToType(this.requestBodyReference.requestBodyType);
        return {
            type: type.typeNodeWithoutUndefined,
            hasQuestionToken: type.isOptional,
        };
    }
}
