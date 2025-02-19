import { OpenAPIV3 } from "openapi-types";

import { ChannelId } from "../sharedTypes";

export interface DocumentV3 {
    asyncapi: string;
    info: Info;
    servers?: Record<string, ServerV3>;
    channels?: Record<ChannelId, ChannelV3>;
    operations?: Record<string, Operation>;
    components?: {
        schemas?: Record<string, OpenAPIV3.SchemaObject>;
        messages?: Record<string, MessageV3>;
    };
}

export interface Info {
    tags?: Tag[];
    externalDocs?: OpenAPIV3.ExternalDocumentationObject;
}

export interface ServerV3 {
    name: string;
    host: string;
    protocol: string;
}

export interface ChannelV3 {
    address?: string;
    bindings?: Bindings;
    messages?: Record<string, MessageV3>;
    servers?: OpenAPIV3.ReferenceObject[];
    // TODO: Add support for reference objects
    parameters?: Record<string, ChannelParameter>;
}

export interface Operation {
    description?: string;
    action: "send" | "receive";
    channel: OpenAPIV3.ReferenceObject;
    messages: OpenAPIV3.ReferenceObject[];
}

export type ChannelParameter = OpenAPIV3.ParameterObject & {
    description?: string;
    location: string;
    enum?: string[];
    default?: string;
    examples?: string[];
};

export interface Tag {
    name: string;
    description?: string;
}

export interface Bindings {
    ws?: WebSocketBindings;
}

export interface MessageV3 {
    name?: string;
    description?: string;
    payload: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
}

export interface WebSocketBindings {
    /* An OpenAPIV3 object where each property is a header */
    headers?: OpenAPIV3.SchemaObject;
    /* An OpenAPIV3 object where each property is a query parameter */
    query?: OpenAPIV3.SchemaObject;
}
