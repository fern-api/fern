import { TypeReference } from "@fern-api/api";

export type ServiceTypeReference = InlinedServiceTypeReference | ModelServiceTypeReference;

export interface InlinedServiceTypeReference {
    // is defined inline in the spec (and thus the type is generated in the
    // /service-types directory in the package)
    isInlined: true;
    typeName: ServiceTypeName;
}

export interface ModelServiceTypeReference {
    // is just a type reference in the spec (and thus a reference to the /types
    // directory in the package)
    isInlined: false;
    typeReference: Exclude<TypeReference, TypeReference.Void>;
}

// TODO define more explicitly
export type ServiceTypeName = string;
