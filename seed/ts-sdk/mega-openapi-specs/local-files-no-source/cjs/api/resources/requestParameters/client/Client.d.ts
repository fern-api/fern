import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { UserClient } from "../resources/user/client/Client.js";
export declare namespace RequestParametersClient {
    type Options = BaseClientOptions;
}
export declare class RequestParametersClient {
    protected readonly _options: NormalizedClientOptions<RequestParametersClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: RequestParametersClient.Options);
    get user(): UserClient;
}
