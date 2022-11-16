import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
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
    const joinedFernFilePath = declaredServiceName.fernFilepathV2
        .map((name) => name.unsafeName.originalValue)
        .join("/");
    const serviceName = declaredServiceName.name;
    const endpointId = httpEndpoint.nameV2.safeName.originalValue;
    return `endpoint_${joinedFernFilePath}:${serviceName}.${endpointId}`;
}

export function getServiceId(declaredServiceName: DeclaredServiceName): ServiceId {
    const joinedFernFilePath = declaredServiceName.fernFilepathV2
        .map((name) => name.unsafeName.originalValue)
        .join("/");
    const serviceName = declaredServiceName.name;
    return `endpoint_${joinedFernFilePath}:${serviceName}`;
}

export function getErrorId(declaredErrorName: DeclaredErrorName): ErrorId {
    const joinedFernFilePath = declaredErrorName.fernFilepathV2.map((name) => name.unsafeName.originalValue).join("/");
    const errorName = declaredErrorName.nameV3.unsafeName.originalValue;
    return `error_${joinedFernFilePath}:${errorName}`;
}

export function getTypeId(declaredTypeName: DeclaredTypeName): TypeId {
    const joinedFernFilePath = declaredTypeName.fernFilepathV2.map((name) => name.unsafeName.originalValue).join("/");
    const typeName = declaredTypeName.nameV3.unsafeName.originalValue;
    return `type_${joinedFernFilePath}:${typeName}`;
}
