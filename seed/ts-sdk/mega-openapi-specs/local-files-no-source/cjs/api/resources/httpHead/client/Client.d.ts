import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { UserClient } from "../resources/user/client/Client.js";
export declare namespace HttpHeadClient {
    type Options = BaseClientOptions;
}
export declare class HttpHeadClient {
    protected readonly _options: NormalizedClientOptions<HttpHeadClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: HttpHeadClient.Options);
    get user(): UserClient;
}
