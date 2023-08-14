import { FernFilepath } from "@fern-fern/ir-sdk/api";

export type AudienceId = string;
export type TypeId = string;
export type ErrorId = string;
export type ServiceId = string;
export type EndpointId = string;
export type SubpackageId = string;

export interface TypeNode {
    typeId: TypeId;
    descendants: Set<TypeId>;
    referencedSubpackages: Set<FernFilepath>;
}

export interface ErrorNode {
    errorId: ErrorId;
    referencedTypes: Set<TypeId>;
    referencedSubpackages: Set<FernFilepath>;
}

export interface EndpointNode {
    endpointId: EndpointId;
    referencedErrors: Set<ErrorId>;
    referencedTypes: Set<TypeId>;
    referencedSubpackages: Set<FernFilepath>;
}
