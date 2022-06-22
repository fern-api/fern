import { TypeReference } from "@fern-api/api";
import { HttpServiceTypeMetadata, WebSocketChannelTypeMetadata } from "@fern-typescript/commons";
import { ServiceTypesConstants } from "../../constants";

export type HttpServiceTypeReference = InlinedServiceTypeReference<HttpServiceTypeMetadata> | ModelServiceTypeReference;
export type WebSocketChannelTypeReference =
    | InlinedServiceTypeReference<WebSocketChannelTypeMetadata>
    | ModelServiceTypeReference;

export type ServiceTypeReference<M> = InlinedServiceTypeReference<M> | ModelServiceTypeReference;

export interface InlinedServiceTypeReference<M> {
    // is defined inline in the spec (and thus the type is generated in the
    // /service-types directory in the package)
    isInlined: true;
    // additional metadata needed for locating & naming the type
    metadata: M;
}

export interface ModelServiceTypeReference {
    // is just a type reference in the spec (and thus a reference to the /types
    // directory in the package)
    isInlined: false;
    typeReference: Exclude<TypeReference, TypeReference.Void>;
}

export type ServiceTypeName =
    | typeof ServiceTypesConstants.Commons.Request.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Request.Properties.Body.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Response.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Response.Success.Properties.Body.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Response.Error.Properties.Body.TYPE_NAME;
