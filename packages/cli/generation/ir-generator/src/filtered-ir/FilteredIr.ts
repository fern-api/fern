import { ErrorDeclaration, HttpEndpoint, HttpService, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { IdGenerator } from "../IdGenerator";
import { EndpointId, ErrorId, ServiceId, SubpackageId, TypeId } from "./ids";

export interface FilteredIr {
    hasType(type: TypeDeclaration): boolean;
    hasTypeId(type: string): boolean;
    hasError(error: ErrorDeclaration): boolean;
    hasErrorId(type: string): boolean;
    hasService(service: HttpService): boolean;
    hasServiceId(type: string): boolean;
    hasEndpoint(endpoint: HttpEndpoint): boolean;
    hasSubpackageId(subpackageId: string): boolean;
}

export class FilteredIrImpl implements FilteredIr {
    private types: Set<TypeId> = new Set();
    private errors: Set<ErrorId> = new Set();
    private services: Set<ServiceId> = new Set();
    private endpoints: Set<EndpointId> = new Set();
    private subpackages: Set<SubpackageId> = new Set();

    public constructor({
        types,
        errors,
        services,
        endpoints,
        subpackages
    }: {
        types: Set<TypeId>;
        errors: Set<ErrorId>;
        services: Set<ServiceId>;
        endpoints: Set<EndpointId>;
        subpackages: Set<SubpackageId>;
    }) {
        this.types = types;
        this.errors = errors;
        this.services = services;
        this.endpoints = endpoints;
        this.subpackages = subpackages;
    }

    public hasTypeId(typeId: string): boolean {
        return this.types.has(typeId);
    }
    public hasErrorId(errorId: string): boolean {
        return this.errors.has(errorId);
    }
    public hasServiceId(serviceId: string): boolean {
        return this.services.has(serviceId);
    }

    public hasSubpackageId(subpackageId: string): boolean {
        return this.subpackages.has(subpackageId);
    }

    public hasType(type: TypeDeclaration): boolean {
        const typeId = IdGenerator.generateTypeId(type.name);
        return this.types.has(typeId);
    }

    public hasError(error: ErrorDeclaration): boolean {
        const errorId = IdGenerator.generateErrorId(error.name);
        return this.errors.has(errorId);
    }

    public hasService(service: HttpService): boolean {
        const serviceId = IdGenerator.generateServiceId(service.name);
        return this.services.has(serviceId);
    }

    public hasEndpoint(endpoint: HttpEndpoint): boolean {
        return this.endpoints.has(endpoint.id);
    }

    public hasSubpackage(subpackageId: string): boolean {
        return this.subpackages.has(subpackageId);
    }
}
