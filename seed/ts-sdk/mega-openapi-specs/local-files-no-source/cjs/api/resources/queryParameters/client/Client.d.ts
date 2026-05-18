import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { UserClient } from "../resources/user/client/Client.js";
export declare namespace QueryParametersClient {
    type Options = BaseClientOptions;
}
export declare class QueryParametersClient {
    protected readonly _options: NormalizedClientOptions<QueryParametersClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: QueryParametersClient.Options);
    get user(): UserClient;
}
