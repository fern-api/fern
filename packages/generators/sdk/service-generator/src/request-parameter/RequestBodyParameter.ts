import { HttpRequestBodyReference } from "@fern-fern/ir-model/services/http";
import { ServiceContext } from "@fern-typescript/contexts";
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

    public getReferenceToRequestBody(): ts.Expression {
        return ts.factory.createIdentifier(this.getRequestParameterName());
    }

    public getReferenceToQueryParameter(): ts.Expression {
        throw new Error("Cannot get reference to query parameter because request is not wrapped");
    }

    public getReferenceToHeader(): ts.Expression {
        throw new Error("Cannot get reference to header because request is not wrapped");
    }

    protected getParameterType(context: ServiceContext): { type: ts.TypeNode; isOptional: boolean } {
        const type = context.type.getReferenceToType(this.requestBodyReference.requestBodyType);
        return {
            type: type.typeNodeWithoutUndefined,
            isOptional: type.isOptional,
        };
    }
}
