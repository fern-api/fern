import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { EndpointTypesContext } from "@fern-typescript/sdk-declaration-handler";
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
        return context.getReferenceToType(this.endpoint.request.typeV2);
    }
}
