import { WithDocs } from "../../commons/WithDocs";
import { WebSocketRequest } from "./WebSocketRequest";
import { WebSocketResponse } from "./WebSocketResponse";

export interface WebSocketOperation extends WithDocs {
    operationId: string;
    request: WebSocketRequest;
    response: WebSocketResponse;
}
