import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { UserClient } from "../resources/user/client/Client.mjs";
export declare namespace ExtraPropertiesClient {
    type Options = BaseClientOptions;
}
export declare class ExtraPropertiesClient {
    protected readonly _options: NormalizedClientOptions<ExtraPropertiesClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: ExtraPropertiesClient.Options);
    get user(): UserClient;
}
