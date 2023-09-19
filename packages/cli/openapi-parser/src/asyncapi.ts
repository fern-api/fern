import { OpenAPIV3 } from "openapi-types";

export interface AsyncAPI {
    channels?: Record<string, Channel>;
    components?: {
        schemas?: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>;
        messages?: Record<string, Message>;
    };
}

export interface Message {
    messageId: string;
    summary?: string;
    payload: OpenAPIV3.ReferenceObject;
}

export interface Channel {
    publish?: PublishEvent;
    subscribe?: SubscribeEvent;
}

export interface PublishEvent {
    description?: string;
    message: OpenAPIV3.SchemaObject;
}

export interface SubscribeEvent {
    description?: string;
    message: OpenAPIV3.SchemaObject;
}
