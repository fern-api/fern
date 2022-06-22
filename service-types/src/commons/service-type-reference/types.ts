import { TypeReference } from "@fern-api/api";
import { ServiceTypeMetadata } from "@fern-typescript/commons";
import { ServiceTypesConstants } from "../../constants";

export type ServiceTypeReference = InlinedServiceTypeReference | ModelServiceTypeReference;

export interface InlinedServiceTypeReference {
    // is inlined in the spec (and thus the type is generated in the
    // service-types directory), not imported from the model
    isInlined: true;
    metadata: ServiceTypeMetadata;
}

export interface ModelServiceTypeReference {
    // is imported from the model
    isInlined: false;
    typeReference: Exclude<TypeReference, TypeReference.Void>;
}

export type ServiceTypeName =
    | typeof ServiceTypesConstants.Commons.Request.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Request.Properties.Body.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Response.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Response.Success.Properties.Body.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Response.Error.Properties.Body.TYPE_NAME;
