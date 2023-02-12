import { FernFilepath } from "@fern-fern/ir-model/commons";
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
    descendents: Set<TypeId>;
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
    const joinedFernFilePath = stringifyFernFilepath(declaredServiceName.fernFilepath);
    const endpointId = httpEndpoint.name.originalName;
    return `endpoint_${joinedFernFilePath}.${endpointId}`;
}

export function getServiceId(declaredServiceName: DeclaredServiceName): ServiceId {
    const joinedFernFilePath = stringifyFernFilepath(declaredServiceName.fernFilepath);
    return `endpoint_${joinedFernFilePath}`;
}

export function getErrorId(declaredErrorName: DeclaredErrorName): ErrorId {
    const joinedFernFilePath = stringifyFernFilepath(declaredErrorName.fernFilepath);
    const errorName = declaredErrorName.name.originalName;
    return `error_${joinedFernFilePath}:${errorName}`;
}

export function getTypeId(declaredTypeName: DeclaredTypeName): TypeId {
    const joinedFernFilePath = stringifyFernFilepath(declaredTypeName.fernFilepath);
    const typeName = declaredTypeName.name.originalName;
    return `type_${joinedFernFilePath}:${typeName}`;
}

function stringifyFernFilepath(fernFilepath: FernFilepath): string {
    return fernFilepath.allParts.map((part) => part.originalName).join("/");
}
