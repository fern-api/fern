import { TypeReference } from "./TypeReference";
import { WebSocketMessageResponseBehavior } from "./WebSocketMessageResponseBehavior";
import { WithDocs } from "./WithDocs";

export interface WebSocketMessageResponse extends WithDocs {
    bodyType: TypeReference;
    /** Defaults to {WebSocketMessageResponseBehavior.ONGOING} */
    behavior: WebSocketMessageResponseBehavior;
}
