import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { EndpointTypesContext } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { AbstractEndpointRequest } from "./AbstractEndpointRequest";
import { GeneratedEndpointRequest } from "./GeneratedEndpointRequest";

export class NotWrappedEndpointRequest extends AbstractEndpointRequest implements GeneratedEndpointRequest {
    public writeToFile(): void {
        // no-op
    }

    public getRequestParameterType(context: EndpointTypesContext): TypeReferenceNode | undefined {
        if (this.endpoint.request.typeV2 == null) {
            return undefined;
        }
        return context.type.getReferenceToType(this.endpoint.request.typeV2);
    }

    public getReferenceToRequestBody(requestParameter: ts.Expression): ts.Expression {
        return requestParameter;
    }

    public getReferenceToQueryParameter(): ts.Expression {
        throw new Error("Request is not wrapped so it does not support query parameters");
    }

    public getReferenceToPathParameter(): ts.Expression {
        throw new Error("Request is not wrapped so it does not support query parameters");
    }

    public getReferenceToHeader(): ts.Expression {
        throw new Error("Request is not wrapped so it does not support query parameters");
    }
}
