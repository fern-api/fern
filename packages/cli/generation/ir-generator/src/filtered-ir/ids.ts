import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { DeclaredServiceName, HttpEndpoint } from "@fern-fern/ir-model/http";
import { DeclaredTypeName } from "@fern-fern/ir-model/types";

export type AudienceId = string;
export type TypeId = string;
export type ErrorId = string;
export type ServiceId = string;
export type EndpointId = string;

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

export function getEndpointId(declaredServiceName: DeclaredServiceName, httpEndpoint: HttpEndpoint): ErrorId {
    const joinedFernFilePath = declaredServiceName.fernFilepath.map((name) => name.originalName).join("/");
    const endpointId = httpEndpoint.name.originalName;
    return `endpoint_${joinedFernFilePath}.${endpointId}`;
}

export function getServiceId(declaredServiceName: DeclaredServiceName): ServiceId {
    const joinedFernFilePath = declaredServiceName.fernFilepath.map((name) => name.originalName).join("/");
    return `endpoint_${joinedFernFilePath}`;
}

export function getErrorId(declaredErrorName: DeclaredErrorName): ErrorId {
    const joinedFernFilePath = declaredErrorName.fernFilepath.map((name) => name.originalName).join("/");
    const errorName = declaredErrorName.name.originalName;
    return `error_${joinedFernFilePath}:${errorName}`;
}

export function getTypeId(declaredTypeName: DeclaredTypeName): TypeId {
    const joinedFernFilePath = declaredTypeName.fernFilepath.map((name) => name.originalName).join("/");
    const typeName = declaredTypeName.name.originalName;
    return `type_${joinedFernFilePath}:${typeName}`;
}
