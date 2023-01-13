import { HttpHeader, QueryParameter } from "@fern-fern/ir-model/http";
import { ServiceContext } from "@fern-typescript/contexts";
import { GeneratedRequestWrapper } from "@fern-typescript/contexts/src/generated-types/GeneratedRequestWrapper";
import { ts } from "ts-morph";
import { AbstractRequestParameter } from "./AbstractRequestParameter";

export class RequestWrapperParameter extends AbstractRequestParameter {
    protected getParameterType(context: ServiceContext): { type: ts.TypeNode; isOptional: boolean } {
        return {
            type: context.requestWrapper.getReferenceToRequestWrapper(
                this.service.name.fernFilepath,
                this.endpoint.name
            ),
            isOptional: this.getGeneratedRequestWrapper(context).areAllPropertiesOptional(context),
        };
    }

    public getReferenceToRequestBody(context: ServiceContext): ts.Expression | undefined {
        return this.getGeneratedRequestWrapper(context).getReferenceToBody({
            requestArgument: ts.factory.createIdentifier(this.getRequestParameterName()),
            isRequestArgumentNullable: this.getParameterType(context).isOptional,
            context,
        });
    }

    public getAllQueryParameters(context: ServiceContext): QueryParameter[] {
        return this.getGeneratedRequestWrapper(context).getAllQueryParameters();
    }

    public getAllHeaders(context: ServiceContext): HttpHeader[] {
        return this.getGeneratedRequestWrapper(context).getAllHeaders();
    }

    public withQueryParameter(
        queryParameter: QueryParameter,
        context: ServiceContext,
        callback: (value: ts.Expression) => ts.Statement[]
    ): ts.Statement[] {
        return this.getGeneratedRequestWrapper(context).withQueryParameter({
            queryParameter,
            requestArgument: ts.factory.createIdentifier(this.getRequestParameterName()),
            isRequestArgumentNullable: this.getParameterType(context).isOptional,
            context,
            callback,
        });
    }

    public getReferenceToHeader(header: HttpHeader, context: ServiceContext): ts.Expression {
        return this.getGeneratedRequestWrapper(context).getReferenceToHeader({
            header,
            requestArgument: ts.factory.createIdentifier(this.getRequestParameterName()),
            isRequestArgumentNullable: this.getParameterType(context).isOptional,
        });
    }

    private getGeneratedRequestWrapper(context: ServiceContext): GeneratedRequestWrapper {
        return context.requestWrapper.getGeneratedRequestWrapper(this.service.name.fernFilepath, this.endpoint.name);
    }
}
