import { getExtension } from "../getExtension";
import { FernAsyncAPIExtension } from "./fernExtensions";
import { AsyncAPIV2 } from "./v2";
import { AsyncAPIV3 } from "./v3";

export interface WebsocketSessionExampleMessage {
    type: string;
    channelId?: string;
    messageId: string;
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    value: any;
}

export interface WebsocketSessionExampleExtension {
    summary?: string;
    description?: string;
    queryParameters?: Record<string, string>;
    headers?: Record<string, string>;
    messages: WebsocketSessionExampleMessage[];
}

export function getFernExamples(
    channel: AsyncAPIV2.ChannelV2 | AsyncAPIV3.ChannelV3
): WebsocketSessionExampleExtension[] {
    return getExtension<WebsocketSessionExampleExtension[]>(channel, FernAsyncAPIExtension.FERN_EXAMPLES) ?? [];
}
