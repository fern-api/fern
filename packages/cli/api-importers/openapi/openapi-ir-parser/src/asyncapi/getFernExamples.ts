import { getExtension } from "../getExtension";
import { FernAsyncAPIExtension } from "./fernExtensions";
import { AsyncAPIV2 } from "./v2";

export interface WebsocketSessionExampleExtension {
    summary?: string;
    description?: string;
    queryParameters?: Record<string, string>;
    headers?: Record<string, string>;
    messages: {
        type: "subscribe" | "publish";
        messageId: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any;
    }[];
}

export function getFernExamples(channel: AsyncAPIV2.Channel): WebsocketSessionExampleExtension[] {
    return getExtension<WebsocketSessionExampleExtension[]>(channel, FernAsyncAPIExtension.FERN_EXAMPLES) ?? [];
}
