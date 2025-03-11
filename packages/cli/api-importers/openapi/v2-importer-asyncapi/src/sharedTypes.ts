import { OpenAPIV3 } from "openapi-types";

import { MessageV2 } from "./2.x/types";
import { MessageV3 } from "./3.0/types";

export type ChannelId = string;

export interface DocumentContext {
    components?: {
        schemas?: Record<string, OpenAPIV3.SchemaObject>;
        messages?: Record<string, MessageV2 | MessageV3>;
    };
    channels?: Record<ChannelId, ChannelContext>;
}

export interface ServerContext {
    name: string;
    url: string;
}

export interface ChannelContext {
    messages?: Record<string, MessageV3>;
}
