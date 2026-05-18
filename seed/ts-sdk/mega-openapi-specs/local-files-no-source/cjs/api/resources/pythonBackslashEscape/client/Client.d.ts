import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { UserClient } from "../resources/user/client/Client.js";
export declare namespace PythonBackslashEscapeClient {
    type Options = BaseClientOptions;
}
export declare class PythonBackslashEscapeClient {
    protected readonly _options: NormalizedClientOptions<PythonBackslashEscapeClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: PythonBackslashEscapeClient.Options);
    get user(): UserClient;
}
