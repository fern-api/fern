import { HttpService } from "./HttpService";
import { WebSocketService } from "./WebSocketService";

export interface Services {
    http: HttpService[];
    webSocket: WebSocketService[];
}
