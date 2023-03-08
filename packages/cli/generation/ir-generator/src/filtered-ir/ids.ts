export type AudienceId = string;
export type TypeId = string;
export type ErrorId = string;
export type ServiceId = string;
export type EndpointId = string;
export type SubpackageId = string;

export interface TypeNode {
    typeId: TypeId;
    descendants: Set<TypeId>;
}

export interface ErrorNode {
    errorId: ErrorId;
    referencedTypes: Set<TypeId>;
}

export interface EndpointNode {
    endpointId: EndpointId;
    referencedErrors: Set<ErrorId>;
    referencedTypes: Set<TypeId>;
}
