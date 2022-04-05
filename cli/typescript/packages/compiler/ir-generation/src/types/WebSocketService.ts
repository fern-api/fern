import { BaseService } from "./BaseService";
import { WebSocketMessage } from "./WebSocketMessage";

export interface WebSocketService extends BaseService {
    messages: WebSocketMessage[];
}
