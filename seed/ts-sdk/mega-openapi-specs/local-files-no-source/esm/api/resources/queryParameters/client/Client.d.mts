import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { UserClient } from "../resources/user/client/Client.mjs";
export declare namespace QueryParametersClient {
    type Options = BaseClientOptions;
}
export declare class QueryParametersClient {
    protected readonly _options: NormalizedClientOptions<QueryParametersClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: QueryParametersClient.Options);
    get user(): UserClient;
}
