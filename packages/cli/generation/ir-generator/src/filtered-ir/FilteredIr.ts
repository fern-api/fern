import {
    ErrorDeclaration,
    HttpEndpoint,
    HttpService,
    TypeDeclaration,
    WebSocketChannel,
    WebSocketChannelId,
    Webhook
} from "@fern-api/ir-sdk";

import { IdGenerator } from "../IdGenerator";
import { EndpointId, EnvironmentId, ErrorId, ServiceId, SubpackageId, TypeId, WebhookId } from "./ids";

export interface FilteredIr {
    hasType(type: TypeDeclaration): boolean;
    hasTypeId(type: string): boolean;
    hasProperty(type: string, property: string): boolean;
    hasError(error: ErrorDeclaration): boolean;
    hasErrorId(type: string): boolean;
    hasService(service: HttpService): boolean;
    hasServiceId(type: string): boolean;
    hasEnvironmentId(environmentId: EnvironmentId): boolean;
    hasEndpoint(endpoint: HttpEndpoint): boolean;
    hasWebhook(webhook: Webhook): boolean;
    hasWebhookPayloadProperty(webhookId: string, property: string): boolean;
    hasRequestProperty(endpoint: string, property: string): boolean;
    hasQueryParameter(endpoint: string, parameter: string): boolean;
    hasSubpackageId(subpackageId: string): boolean;
    hasChannel(channel: WebSocketChannel): boolean;
}

export class FilteredIrImpl implements FilteredIr {
    private environments: Set<EnvironmentId> = new Set();
    private types: Set<TypeId> = new Set();
    private properties: Record<TypeId, Set<string> | undefined>;
    private errors: Set<ErrorId> = new Set();
    private services: Set<ServiceId> = new Set();
    private endpoints: Set<EndpointId> = new Set();
    private requestProperties: Record<EndpointId, Set<string> | undefined>;
    private queryParameters: Record<EndpointId, Set<string> | undefined>;
    private webhooks: Set<WebhookId> = new Set();
    private webhookPayloadProperties: Record<WebhookId, Set<string> | undefined>;
    private channels: Set<WebSocketChannelId> = new Set();
    private subpackages: Set<SubpackageId> = new Set();

    public constructor({
        types,
        properties,
        errors,
        environments,
        services,
        endpoints,
        webhooks,
        subpackages,
        queryParameters,
        requestProperties,
        webhookPayloadProperties,
        channels
    }: {
        types: Set<TypeId>;
        properties: Record<TypeId, Set<string> | undefined>;
        errors: Set<ErrorId>;
        environments: Set<EnvironmentId>;
        services: Set<ServiceId>;
        queryParameters: Record<EndpointId, Set<string> | undefined>;
        requestProperties: Record<EndpointId, Set<string> | undefined>;
        endpoints: Set<EndpointId>;
        webhooks: Set<WebhookId>;
        webhookPayloadProperties: Record<WebhookId, Set<string> | undefined>;
        subpackages: Set<SubpackageId>;
        channels: Set<WebSocketChannelId>;
    }) {
        this.environments = environments;
        this.types = types;
        this.properties = properties;
        this.errors = errors;
        this.services = services;
        this.endpoints = endpoints;
        this.webhooks = webhooks;
        this.webhookPayloadProperties = webhookPayloadProperties;
        this.subpackages = subpackages;
        this.requestProperties = requestProperties;
        this.queryParameters = queryParameters;
        this.channels = channels;
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

    public hasProperty(typeId: string, property: string): boolean {
        const properties = this.properties[typeId];
        if (properties == null) {
            // No audiences were configured.
            return true;
        }
        return properties.has(property);
    }

    public hasError(error: ErrorDeclaration): boolean {
        const errorId = IdGenerator.generateErrorId(error.name);
        return this.errors.has(errorId);
    }

    public hasService(service: HttpService): boolean {
        const serviceId = IdGenerator.generateServiceId(service.name);
        return this.services.has(serviceId);
    }

    public hasEnvironmentId(environmentId: EnvironmentId): boolean {
        return this.environments.has(environmentId);
    }

    public hasEndpoint(endpoint: HttpEndpoint): boolean {
        return this.endpoints.has(endpoint.id);
    }

    public hasRequestProperty(endpoint: string, property: string): boolean {
        const properties = this.requestProperties[endpoint];
        if (properties == null) {
            // No audiences were configured.
            return true;
        }
        return properties.has(property);
    }

    public hasQueryParameter(endpoint: string, parameter: string): boolean {
        const parameters = this.queryParameters[endpoint];
        if (parameters == null) {
            // No audiences were configured.
            return true;
        }
        return parameters.has(parameter);
    }

    public hasSubpackage(subpackageId: string): boolean {
        return this.subpackages.has(subpackageId);
    }

    public hasWebhook(webhook: Webhook): boolean {
        if (webhook.id) {
            return this.webhooks.has(webhook.id);
        }
        return true;
    }

    public hasChannel(channel: WebSocketChannel): boolean {
        if (channel.name.originalName) {
            return this.channels.has(channel.name.originalName);
        }
        return true;
    }

    public hasWebhookPayloadProperty(webhookId: string, property: string): boolean {
        const properties = this.webhookPayloadProperties[webhookId];
        if (properties == null) {
            // No audiences were configured.
            return true;
        }
        return properties.has(property);
    }
}
