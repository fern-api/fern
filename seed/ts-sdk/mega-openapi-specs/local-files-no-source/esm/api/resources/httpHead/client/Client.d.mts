import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { UserClient } from "../resources/user/client/Client.mjs";
export declare namespace HttpHeadClient {
    type Options = BaseClientOptions;
}
export declare class HttpHeadClient {
    protected readonly _options: NormalizedClientOptions<HttpHeadClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: HttpHeadClient.Options);
    get user(): UserClient;
}
