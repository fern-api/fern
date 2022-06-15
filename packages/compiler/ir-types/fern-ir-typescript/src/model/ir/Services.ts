import { HttpService } from "../services/http/HttpService";
import { WebSocketChannel } from "../services/websocket/WebSocketChannel";

export interface Services {
    http: HttpService[];
    websocket: WebSocketChannel[];
}
