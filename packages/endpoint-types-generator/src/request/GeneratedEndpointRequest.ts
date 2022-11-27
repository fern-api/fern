import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { EndpointTypesContext } from "@fern-typescript/sdk-declaration-handler";

export interface GeneratedEndpointRequest {
    writeToFile(context: EndpointTypesContext): void;
    getRequestParameterType(context: EndpointTypesContext): TypeReferenceNode | undefined;
}
