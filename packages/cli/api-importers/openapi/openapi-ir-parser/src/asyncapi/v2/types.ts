import { OpenAPIV3 } from "openapi-types";

import { ChannelId } from "../sharedTypes";

export interface DocumentV2 {
    asyncapi: string;
    servers?: Record<string, ServerV2>;
    channels?: Record<ChannelId, ChannelV2>;
    components?: {
        schemas?: Record<string, OpenAPIV3.SchemaObject>;
        messages?: Record<string, MessageV2>;
        parameters?: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject>;
    };
    tags?: Tag[];
}

export interface ServerV2 {
    name: string;
    url: string;
    protocol: string;
}

export interface ChannelV2 {
    address?: string;
    bindings?: Bindings;
    publish?: PublishEvent;
    subscribe?: SubscribeEvent;
    servers?: string[];
    parameters?: Record<string, OpenAPIV3.ParameterObject>;
    description?: string;
}

export interface Tag {
    name: string;
    description?: string;
    externalDocs?: OpenAPIV3.ExternalDocumentationObject;
}

export interface Bindings {
    ws?: WebSocketBindings;
}

export interface WebSocketBindings {
    /* An OpenAPIV3 object where each property is a header */
    headers?: OpenAPIV3.SchemaObject;
    /* An OpenAPIV3 object where each property is a query parameter */
    query?: OpenAPIV3.SchemaObject;
}

export interface MessageV2 {
    messageId: string;
    name?: string;
    summary?: string;
    payload: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
}

export interface PublishEvent {
    description?: string;
    operationId?: string;
    message: OpenAPIV3.SchemaObject | MessageV2;
}

export interface SubscribeEvent {
    description?: string;
    operationId?: string;
    message: OpenAPIV3.SchemaObject;
}
