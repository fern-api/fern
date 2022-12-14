import { HttpHeader, QueryParameter } from "@fern-fern/ir-model/services/http";
import { ServiceContext } from "@fern-typescript/contexts";
import { GeneratedRequestWrapper } from "@fern-typescript/contexts/src/generated-types/GeneratedRequestWrapper";
import { ts } from "ts-morph";
import { AbstractRequestParameter } from "./AbstractRequestParameter";

export class RequestWrapperParameter extends AbstractRequestParameter {
    protected getParameterType(context: ServiceContext): { type: ts.TypeNode; isOptional: boolean } {
        return {
            type: context.requestWrapper.getReferenceToRequestWrapper(this.service.name, this.endpoint.id),
            isOptional: this.getGeneratedRequestWrapper(context).areAllPropertiesOptional(context),
        };
    }

    public getReferenceToRequestBody(context: ServiceContext): ts.Expression | undefined {
        return this.getGeneratedRequestWrapper(context).getReferenceToBody(
            ts.factory.createIdentifier(this.getRequestParameterName()),
            context
        );
    }

    public getReferenceToQueryParameter(queryParameter: QueryParameter, context: ServiceContext): ts.Expression {
        return this.getGeneratedRequestWrapper(context).getReferenceToQueryParameter(
            queryParameter,
            ts.factory.createIdentifier(this.getRequestParameterName())
        );
    }

    public getReferenceToHeader(header: HttpHeader, context: ServiceContext): ts.Expression {
        return this.getGeneratedRequestWrapper(context).getReferenceToHeader(
            header,
            ts.factory.createIdentifier(this.getRequestParameterName())
        );
    }

    private getGeneratedRequestWrapper(context: ServiceContext): GeneratedRequestWrapper {
        return context.requestWrapper.getGeneratedRequestWrapper(this.service.name, this.endpoint.id);
    }
}
