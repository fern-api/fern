import { TypeReference } from "@fern-api/api";

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

/**
 * TODO this is kinda weird. For endpoints, wrapper refers to something the consumer passes in (e.g. it includes query
 * params). in websockets it refers to the wrapper that is never exposed to consumers (e.g. "id", "operation").
 */
export interface GeneratedRequest<M> {
    body: ServiceTypeReference<M> | undefined;
    // if there's additional properties with the request, the body might be wrappd
    wrapper:
        | {
              propertyName: string;
              reference: ServiceTypeReference<M>;
          }
        | undefined;
}
