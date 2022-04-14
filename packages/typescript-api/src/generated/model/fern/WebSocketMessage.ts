import { WebsocketError } from "./WebsocketError";
import { WebSocketMessageBody } from "./WebSocketMessageBody";
import { WebSocketMessageOrigin } from "./WebSocketMessageOrigin";
import { WebSocketMessageResponse } from "./WebSocketMessageResponse";
import { WithDocs } from "./WithDocs";

export interface WebSocketMessage extends WithDocs {
    origin: WebSocketMessageOrigin;
    body: WebSocketMessageBody | null | undefined;
    response: WebSocketMessageResponse | null | undefined;
    errors: WebsocketError[];
}
