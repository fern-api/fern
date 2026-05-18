import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { AuthClient } from "../resources/auth/client/Client.mjs";
export declare namespace WebsocketInferredAuthClient {
    type Options = BaseClientOptions;
}
export declare class WebsocketInferredAuthClient {
    protected readonly _options: NormalizedClientOptions<WebsocketInferredAuthClient.Options>;
    protected _auth: AuthClient | undefined;
    constructor(options: WebsocketInferredAuthClient.Options);
    get auth(): AuthClient;
}
