import { OpenAPIV3 } from "openapi-types";

import { ChannelId } from "../sharedTypes";

export interface DocumentV2 {
    asyncapi: string;
    channels?: Record<ChannelId, Channel>;
    components?: {
        schemas?: Record<string, OpenAPIV3.SchemaObject>;
        messages?: Record<string, MessageV2>;
    };
    tags?: Tag[];
}

export interface Channel {
    address?: string;
    bindings?: Bindings;
    publish?: PublishEvent;
    subscribe?: SubscribeEvent;
    parameters?: Record<string, OpenAPIV3.ParameterObject>;
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
