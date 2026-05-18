import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { UserClient } from "../resources/user/client/Client.mjs";
export declare namespace RequestParametersClient {
    type Options = BaseClientOptions;
}
export declare class RequestParametersClient {
    protected readonly _options: NormalizedClientOptions<RequestParametersClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: RequestParametersClient.Options);
    get user(): UserClient;
}
