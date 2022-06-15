import { WithDocs } from "../../commons/WithDocs";
import { NamedType } from "../../types/NamedType";
import { WebSocketMessenger } from "./WebSocketMessenger";
import { WebSocketOperationProperties } from "./WebSocketOperationProperties";

export interface WebSocketChannel extends WithDocs {
    name: NamedType;
    path: string;
    client: WebSocketMessenger;
    server: WebSocketMessenger;
    operationProperties: WebSocketOperationProperties;
}
