import { HttpHeader, QueryParameter } from "@fern-fern/ir-model/http";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import { GeneratedRequestWrapper } from "@fern-typescript/contexts/src/generated-types/GeneratedRequestWrapper";
import { ts } from "ts-morph";
import { AbstractRequestParameter } from "./AbstractRequestParameter";

export class RequestWrapperParameter extends AbstractRequestParameter {
    protected getParameterType(context: SdkClientClassContext): { type: ts.TypeNode; isOptional: boolean } {
        return {
            type: context.requestWrapper.getReferenceToRequestWrapper(
                this.service.name.fernFilepath,
                this.endpoint.name
            ),
            isOptional: this.getGeneratedRequestWrapper(context).areAllPropertiesOptional(context),
        };
    }

    public getReferenceToRequestBody(context: SdkClientClassContext): ts.Expression | undefined {
        return this.getGeneratedRequestWrapper(context).getReferenceToBody({
            requestArgument: ts.factory.createIdentifier(this.getRequestParameterName()),
            isRequestArgumentNullable: this.getParameterType(context).isOptional,
            context,
        });
    }

    public getAllQueryParameters(context: SdkClientClassContext): QueryParameter[] {
        return this.getGeneratedRequestWrapper(context).getAllQueryParameters();
    }

    public getAllHeaders(context: SdkClientClassContext): HttpHeader[] {
        return this.getGeneratedRequestWrapper(context).getAllHeaders();
    }

    public withQueryParameter(
        queryParameter: QueryParameter,
        context: SdkClientClassContext,
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

    public getReferenceToHeader(header: HttpHeader, context: SdkClientClassContext): ts.Expression {
        return this.getGeneratedRequestWrapper(context).getReferenceToHeader({
            header,
            requestArgument: ts.factory.createIdentifier(this.getRequestParameterName()),
            isRequestArgumentNullable: this.getParameterType(context).isOptional,
        });
    }

    private getGeneratedRequestWrapper(context: SdkClientClassContext): GeneratedRequestWrapper {
        return context.requestWrapper.getGeneratedRequestWrapper(this.service.name.fernFilepath, this.endpoint.name);
    }
}
