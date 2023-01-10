import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { TypeDeclaration } from "@fern-fern/ir-model/types";
import { EndpointId, ErrorId, getEndpointId, getErrorId, getServiceId, getTypeId, ServiceId, TypeId } from "./ids";

export interface FilteredIr {
    hasType(type: TypeDeclaration): boolean;
    hasError(error: ErrorDeclaration): boolean;
    hasService(service: HttpService): boolean;
    hasEndpoint(service: HttpService, endpoint: HttpEndpoint): boolean;
}

export class FilteredIrImpl implements FilteredIr {
    private types: Set<TypeId> = new Set();
    private errors: Set<ErrorId> = new Set();
    private services: Set<ServiceId> = new Set();
    private endpoints: Set<EndpointId> = new Set();

    public constructor({
        types,
        errors,
        services,
        endpoints,
    }: {
        types: Set<TypeId>;
        errors: Set<ErrorId>;
        services: Set<ServiceId>;
        endpoints: Set<EndpointId>;
    }) {
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
