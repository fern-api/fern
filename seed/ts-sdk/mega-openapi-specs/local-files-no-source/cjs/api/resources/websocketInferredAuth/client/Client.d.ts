import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { AuthClient } from "../resources/auth/client/Client.js";
export declare namespace WebsocketInferredAuthClient {
    type Options = BaseClientOptions;
}
export declare class WebsocketInferredAuthClient {
    protected readonly _options: NormalizedClientOptions<WebsocketInferredAuthClient.Options>;
    protected _auth: AuthClient | undefined;
    constructor(options: WebsocketInferredAuthClient.Options);
    get auth(): AuthClient;
}
