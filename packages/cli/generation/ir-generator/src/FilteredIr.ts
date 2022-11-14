import { noop } from "@fern-api/core-utils";
import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { ContainerType, DeclaredTypeName, TypeDeclaration, TypeReference } from "@fern-fern/ir-model/types";

type AudienceId = string;
type TypeId = string;
type ErrorId = string;
type ServiceId = string;
type EndpointId = string;

interface TypeNode {
    typeId: TypeId;
    descendants: Set<TypeId>;
}

interface ErrorNode {
    errorId: ErrorId;
    referencedTypes: Set<TypeId>;
}

interface EndpointNode {
    endpointId: EndpointId;
    referencedErrors: Set<ErrorId>;
    referencedTypes: Set<TypeId>;
}

export function getFilteredIrBuilder(audiences: AudienceId[]): FilteredIrBuilder {
    if (audiences.length === 0) {
        return new NoopBuilder();
    }
    return new GraphBuilder(audiences);
}

abstract class FilteredIrBuilder {
    public abstract addType(declaredTypeName: DeclaredTypeName, descendants: DeclaredTypeName[]): void;

    public abstract markTypeForAudiences(declaredTypeName: DeclaredTypeName, audiences: AudienceId[]): void;

    public abstract addError(errorDeclaration: ErrorDeclaration): void;

    public abstract addEndpoint(declaredServiceName: DeclaredServiceName, httpEndpoint: HttpEndpoint): void;

    public abstract markEndpointForAudience(
        declaredServiceName: DeclaredServiceName,
        httpEndpoints: HttpEndpoint[],
        audiences: AudienceId[]
    ): void;

    public abstract build(): FilteredIr;
}

export abstract class FilteredIr {
    public abstract hasType(type: TypeDeclaration): boolean;

    public abstract hasError(error: ErrorDeclaration): boolean;

    public abstract hasService(service: HttpService): boolean;

    public abstract hasEndpoint(service: HttpService, endpoint: HttpEndpoint): boolean;
}

export class FilteredIrImpl implements FilteredIr {
    private types: Set<TypeId> = new Set();
    private errors: Set<ErrorId> = new Set();
    private services: Set<ServiceId> = new Set();
    private endpoints: Set<EndpointId> = new Set();

    public constructor(types: Set<TypeId>, errors: Set<ErrorId>, services: Set<ServiceId>, endpoints: Set<EndpointId>) {
        this.types = types;
        this.errors = errors;
        this.services = services;
        this.endpoints = endpoints;
    }

    public hasType(type: TypeDeclaration): boolean {
        const typeId = getTypeId(type.name);
        return this.types.has(typeId);
    }

    public hasError(error: ErrorDeclaration): boolean {
        const errorId = getErrorId(error.name);
        return this.errors.has(errorId);
    }

    public hasService(service: HttpService): boolean {
        const serviceId = getServiceId(service.name);
        return this.services.has(serviceId);
    }

    public hasEndpoint(service: HttpService, endpoint: HttpEndpoint): boolean {
        const endpointId = getEndpointId(service.name, endpoint);
        return this.endpoints.has(endpointId);
    }
}

export class UnfilteredIr implements FilteredIr {
    public hasType(_type: TypeDeclaration): boolean {
        return true;
    }

    public hasError(_error: ErrorDeclaration): boolean {
        return true;
    }

    public hasService(_service: HttpService): boolean {
        return true;
    }

    public hasEndpoint(_service: HttpService, _endpoint: HttpEndpoint): boolean {
        return true;
    }
}

class GraphBuilder extends FilteredIrBuilder {
    private types: Record<TypeId, TypeNode> = {};
    private typesNeededForAudience: Set<TypeId> = new Set();
    private errors: Record<TypeId, ErrorNode> = {};
    private endpoints: Record<EndpointId, EndpointNode> = {};
    private servicesNeededForAudience: Set<ServiceId> = new Set();
    private endpointsNeededForAudience: Set<EndpointId> = new Set();
    private audiences: Set<AudienceId> = new Set();

    public constructor(audiences: AudienceId[]) {
        super();
        this.audiences = new Set(audiences);
    }

    public addType(declaredTypeName: DeclaredTypeName, descendants: DeclaredTypeName[]): void {
        const typeId = getTypeId(declaredTypeName);
        const typeNode: TypeNode = {
            typeId,
            descendants: new Set(...descendants.map((declaredTypeName) => getTypeId(declaredTypeName))),
        };
        this.types[typeId] = typeNode;
    }

    public markTypeForAudiences(declaredTypeName: DeclaredTypeName, audiences: string[]): void {
        const typeId = getTypeId(declaredTypeName);
        if (this.hasAudience(audiences)) {
            this.typesNeededForAudience.add(typeId);
        }
    }

    public addError(errorDeclaration: ErrorDeclaration): void {
        const errorId = getErrorId(errorDeclaration.name);
        const referencedTypes = new Set<TypeId>();
        if (errorDeclaration.typeV3 != null) {
            populateReferencesFromTypeReference(errorDeclaration.typeV3, referencedTypes);
        }
        const errorNode: ErrorNode = {
            errorId,
            referencedTypes,
        };
        this.errors[errorId] = errorNode;
    }

    public addEndpoint(declaredServiceName: DeclaredServiceName, httpEndpoint: HttpEndpoint): void {
        const endpointId = getEndpointId(declaredServiceName, httpEndpoint);
        const referencedTypes = new Set<TypeId>();
        const referencedErrors = new Set<ErrorId>();
        if (httpEndpoint.request.typeV2 != null) {
            populateReferencesFromTypeReference(httpEndpoint.request.typeV2, referencedTypes);
        }
        if (httpEndpoint.response.typeV2 != null) {
            populateReferencesFromTypeReference(httpEndpoint.response.typeV2, referencedTypes);
        }
        httpEndpoint.errors.forEach((responseError) => {
            referencedErrors.add(getErrorId(responseError.error));
        });
        this.endpoints[endpointId] = {
            endpointId,
            referencedTypes,
            referencedErrors,
        };
    }

    public markEndpointForAudience(
        declaredServiceName: DeclaredServiceName,
        httpEndpoints: HttpEndpoint[],
        audiences: AudienceId[]
    ): void {
        if (this.hasAudience(audiences)) {
            const serviceId = getServiceId(declaredServiceName);
            this.servicesNeededForAudience.add(serviceId);
            httpEndpoints.forEach((httpEndpoint) => {
                const endpointId = getEndpointId(declaredServiceName, httpEndpoint);
                this.endpointsNeededForAudience.add(endpointId);
            });
            this.servicesNeededForAudience.add(serviceId);
        }
    }

    public build(): FilteredIr {
        const typeIds = new Set<TypeId>();
        const errorIds = new Set<ErrorId>();
        for (const endpointId of this.endpointsNeededForAudience.keys()) {
            const endpointNode = this.getEndpointNode(endpointId);
            for (const errorId of endpointNode.referencedErrors) {
                if (errorIds.has(errorId)) {
                    continue;
                }
                errorIds.add(errorId);
                const errorNode = this.getErrorNode(errorId);
                this.addReferencedTypes(typeIds, errorNode.referencedTypes);
            }
            this.addReferencedTypes(typeIds, endpointNode.referencedTypes);
        }
        this.addReferencedTypes(typeIds, this.typesNeededForAudience);
        return new FilteredIrImpl(typeIds, errorIds, this.servicesNeededForAudience, this.endpointsNeededForAudience);
    }

    private addReferencedTypes(types: Set<TypeId>, typesToAdd: Set<TypeId>): void {
        for (const typeId of typesToAdd.keys()) {
            if (types.has(typeId)) {
                continue;
            }
            types.add(typeId);
            const typeNode = this.getTypeNode(typeId);
            typeNode.descendants.forEach((descendantTypeId) => {
                types.add(descendantTypeId);
            });
        }
    }

    private getTypeNode(typeId: TypeId): TypeNode {
        const typeNode = this.types[typeId];
        if (typeNode == null) {
            throw new Error(`Failed to find type node with id ${typeId}`);
        }
        return typeNode;
    }

    private getErrorNode(errorId: ErrorId): ErrorNode {
        const errorNode = this.errors[errorId];
        if (errorNode == null) {
            throw new Error(`Failed to find error node with id ${errorId}`);
        }
        return errorNode;
    }

    private getEndpointNode(endpointId: EndpointId): EndpointNode {
        const endpointNode = this.endpoints[endpointId];
        if (endpointNode == null) {
            throw new Error(`Failed to find endpoint node with id ${endpointId}`);
        }
        return endpointNode;
    }

    private hasAudience(audiences: AudienceId[]): boolean {
        return audiences.some((audienceId) => this.audiences.has(audienceId));
    }
}

class NoopBuilder extends FilteredIrBuilder {
    public addType(_declaredTypeName: DeclaredTypeName, _descendants: DeclaredTypeName[]): void {
        return;
    }
    public markTypeForAudiences(_declaredTypeName: DeclaredTypeName, _audiences: string[]): void {
        return;
    }
    public addError(_errorDeclaration: ErrorDeclaration): void {
        return;
    }
    public addEndpoint(_declaredServiceName: DeclaredServiceName, _httpEndpoint: HttpEndpoint): void {
        return;
    }
    public markEndpointForAudience(
        _declaredServiceName: DeclaredServiceName,
        _httpEndpoints: HttpEndpoint[],
        _audiences: AudienceId[]
    ): void {
        return;
    }
    public build(): FilteredIr {
        return new UnfilteredIr();
    }
}

function populateReferencesFromTypeReference(typeReference: TypeReference, referencedTypes: Set<TypeId>) {
    TypeReference._visit(typeReference, {
        container: (containerType) => {
            populateReferencesFromContainer(containerType, referencedTypes);
        },
        named: (declaredTypeName) => {
            referencedTypes.add(getTypeId(declaredTypeName));
        },
        primitive: noop,
        unknown: noop,
        void: noop,
        _unknown: noop,
    });
}

function populateReferencesFromContainer(containerType: ContainerType, referencedTypes: Set<TypeId>) {
    ContainerType._visit(containerType, {
        list: (listType) => {
            populateReferencesFromTypeReference(listType, referencedTypes);
        },
        map: (mapType) => {
            populateReferencesFromTypeReference(mapType.keyType, referencedTypes);
            populateReferencesFromTypeReference(mapType.valueType, referencedTypes);
        },
        optional: (optionalType) => {
            populateReferencesFromTypeReference(optionalType, referencedTypes);
        },
        set: (setType) => {
            populateReferencesFromTypeReference(setType, referencedTypes);
        },
        literal: noop,
        _unknown: noop,
    });
}

function getEndpointId(declaredServiceName: DeclaredServiceName, httpEndpoint: HttpEndpoint): ErrorId {
    const joinedFernFilePath = declaredServiceName.fernFilepathV2
        .map((name) => name.unsafeName.originalValue)
        .join("/");
    const serviceName = declaredServiceName.name;
    const endpointId = httpEndpoint.nameV2.safeName.originalValue;
    return `endpoint_${joinedFernFilePath}:${serviceName}.${endpointId}`;
}

function getServiceId(declaredServiceName: DeclaredServiceName): ServiceId {
    const joinedFernFilePath = declaredServiceName.fernFilepathV2
        .map((name) => name.unsafeName.originalValue)
        .join("/");
    const serviceName = declaredServiceName.name;
    return `endpoint_${joinedFernFilePath}:${serviceName}`;
}

function getErrorId(declaredErrorName: DeclaredErrorName): ErrorId {
    const joinedFernFilePath = declaredErrorName.fernFilepathV2.map((name) => name.unsafeName.originalValue).join("/");
    const errorName = declaredErrorName.nameV3.unsafeName.originalValue;
    return `error_${joinedFernFilePath}:${errorName}`;
}

function getTypeId(declaredTypeName: DeclaredTypeName): TypeId {
    const joinedFernFilePath = declaredTypeName.fernFilepathV2.map((name) => name.unsafeName.originalValue).join("/");
    const typeName = declaredTypeName.nameV3.unsafeName.originalValue;
    return `type_${joinedFernFilePath}:${typeName}`;
}
