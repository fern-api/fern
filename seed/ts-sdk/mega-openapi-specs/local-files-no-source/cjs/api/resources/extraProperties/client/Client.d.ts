import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { UserClient } from "../resources/user/client/Client.js";
export declare namespace ExtraPropertiesClient {
    type Options = BaseClientOptions;
}
export declare class ExtraPropertiesClient {
    protected readonly _options: NormalizedClientOptions<ExtraPropertiesClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: ExtraPropertiesClient.Options);
    get user(): UserClient;
}
