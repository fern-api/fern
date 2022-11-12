import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { ContainerType, DeclaredTypeName, TypeReference } from "@fern-fern/ir-model/types";
import { noop } from "lodash-es";

export class IrGraph {
    private types: Record<TypeId, TypeNode> = {};
    private typesNeededByAudience: Record<AudienceId, Set<TypeId>> = {};
    private errors: Record<ErrorId, ErrorNode> = {};
    private endpoints: Record<EndpointId, EndpointNode> = {};
    private audienceToSubServices: Record<AudienceId, Record<ServiceId, SubService>> = {};

    public addType(declaredTypeName: DeclaredTypeName, descendants: DeclaredTypeName[], audiences: AudienceId[]): void {
        const typeNode = new TypeNode(declaredTypeName, descendants);
        this.types[typeNode.id] = typeNode;
        for (const audienceId of audiences) {
            if (this.typesNeededByAudience[audienceId] == null) {
                this.typesNeededByAudience[audienceId] = new Set();
            }
            this.typesNeededByAudience[audienceId]?.add(typeNode.id);
        }
        return;
    }

    public addError(errorDeclaration: ErrorDeclaration): void {
        const errorNode = new ErrorNode(errorDeclaration);
        this.errors[errorNode.id] = errorNode;
        return;
    }

    public addEndpoint(declaredServiceName: DeclaredServiceName, httpEndpoint: HttpEndpoint): void {
        const endpointNode = new EndpointNode(declaredServiceName, httpEndpoint);
        this.endpoints[endpointNode.id] = endpointNode;
        return;
    }

    public addSubService(
        declaredServiceName: DeclaredServiceName,
        httpEndpoints: HttpEndpoint[],
        audienceId: AudienceId
    ): void {
        const subService = new SubService(declaredServiceName, httpEndpoints);
        if (this.audienceToSubServices[audienceId] == null) {
            this.audienceToSubServices[audienceId] = {};
        }
        const audienceSubServices = this.audienceToSubServices[audienceId];
        if (audienceSubServices != null) {
            audienceSubServices[subService.id] = subService;
        }
    }
}

type AudienceId = string;
type TypeId = string;
type ErrorId = string;
type ServiceId = string;
type EndpointId = string;

class TypeNode {
    public readonly id: TypeId;
    private descendants: Set<TypeId> = new Set();

    constructor(declaredTypeName: DeclaredTypeName, descendants: DeclaredTypeName[]) {
        this.id = getTypeId(declaredTypeName);
        descendants.map((declaredTypeName) => this.descendants.add(getTypeId(declaredTypeName)));
    }
}

class ErrorNode {
    public readonly id: ErrorId;
    private referencedTypes: Set<TypeId> = new Set();

    constructor(errorDeclaration: ErrorDeclaration) {
        this.id = getErrorId(errorDeclaration.name);
        if (errorDeclaration.typeV3 != null) {
            populateReferencesFromTypeReference(errorDeclaration.typeV3, this.referencedTypes);
        }
    }
}

class EndpointNode {
    public readonly id: EndpointId;
    private referencedErrors: Set<ErrorId> = new Set();
    private referencedTypes: Set<TypeId> = new Set();

    constructor(declaredServiceName: DeclaredServiceName, httpEndpoint: HttpEndpoint) {
        this.id = getEndpointId(declaredServiceName, httpEndpoint);
        if (httpEndpoint.request.typeV2 != null) {
            populateReferencesFromTypeReference(httpEndpoint.request.typeV2, this.referencedTypes);
        }
        if (httpEndpoint.response.typeV2 != null) {
            populateReferencesFromTypeReference(httpEndpoint.response.typeV2, this.referencedTypes);
        }
        httpEndpoint.errors.forEach((responseError) => {
            this.referencedErrors.add(getErrorId(responseError.error));
        });
    }
}

class SubService {
    public readonly id: ServiceId;
    private endpoints: Set<EndpointId> = new Set();

    constructor(declaredServiceName: DeclaredServiceName, httpEndpoints: HttpEndpoint[]) {
        this.id = getServiceId(declaredServiceName);
        httpEndpoints.forEach((httpEndpoint) => {
            this.endpoints.add(getEndpointId(declaredServiceName, httpEndpoint));
        });
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
