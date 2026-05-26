import {
    ErrorDeclaration,
    HttpEndpoint,
    HttpService,
    TypeDeclaration,
    Webhook,
    WebSocketChannelId
} from "@fern-api/ir-sdk";

import { IdGenerator } from "../utils/IdGenerator.js";
import { EndpointId, EnvironmentId, ErrorId, ServiceId, SubpackageId, TypeId, WebhookId } from "./ids.js";

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
    hasChannel(channelId: WebSocketChannelId): boolean;
}

export class FilteredIrImpl implements FilteredIr {
    private environments: Set<EnvironmentId> = new Set();
    private types: Set<TypeId> = new Set();
    // Property wire-names to exclude per type/endpoint/webhook. `undefined` means no
    // filtering applies and every property is kept.
    private excludedProperties: Record<TypeId, Set<string> | undefined>;
    private errors: Set<ErrorId> = new Set();
    private services: Set<ServiceId> = new Set();
    private endpoints: Set<EndpointId> = new Set();
    private excludedRequestProperties: Record<EndpointId, Set<string> | undefined>;
    private excludedQueryParameters: Record<EndpointId, Set<string> | undefined>;
    private webhooks: Set<WebhookId> = new Set();
    private excludedWebhookPayloadProperties: Record<WebhookId, Set<string> | undefined>;
    private channels: Set<WebSocketChannelId> = new Set();
    private subpackages: Set<SubpackageId> = new Set();

    public constructor({
        types,
        excludedProperties,
        errors,
        environments,
        services,
        endpoints,
        webhooks,
        subpackages,
        excludedQueryParameters,
        excludedRequestProperties,
        excludedWebhookPayloadProperties,
        channels
    }: {
        types: Set<TypeId>;
        excludedProperties: Record<TypeId, Set<string> | undefined>;
        errors: Set<ErrorId>;
        environments: Set<EnvironmentId>;
        services: Set<ServiceId>;
        excludedQueryParameters: Record<EndpointId, Set<string> | undefined>;
        excludedRequestProperties: Record<EndpointId, Set<string> | undefined>;
        endpoints: Set<EndpointId>;
        webhooks: Set<WebhookId>;
        excludedWebhookPayloadProperties: Record<WebhookId, Set<string> | undefined>;
        subpackages: Set<SubpackageId>;
        channels: Set<WebSocketChannelId>;
    }) {
        this.environments = environments;
        this.types = types;
        this.excludedProperties = excludedProperties;
        this.errors = errors;
        this.services = services;
        this.endpoints = endpoints;
        this.webhooks = webhooks;
        this.excludedWebhookPayloadProperties = excludedWebhookPayloadProperties;
        this.subpackages = subpackages;
        this.excludedRequestProperties = excludedRequestProperties;
        this.excludedQueryParameters = excludedQueryParameters;
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
        const excluded = this.excludedProperties[typeId];
        return excluded == null || !excluded.has(property);
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
        const excluded = this.excludedRequestProperties[endpoint];
        return excluded == null || !excluded.has(property);
    }

    public hasQueryParameter(endpoint: string, parameter: string): boolean {
        const excluded = this.excludedQueryParameters[endpoint];
        return excluded == null || !excluded.has(parameter);
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

    public hasChannel(channelId: WebSocketChannelId): boolean {
        if (channelId) {
            return this.channels.has(channelId);
        }
        return true;
    }

    public hasWebhookPayloadProperty(webhookId: string, property: string): boolean {
        const excluded = this.excludedWebhookPayloadProperties[webhookId];
        return excluded == null || !excluded.has(property);
    }
}
