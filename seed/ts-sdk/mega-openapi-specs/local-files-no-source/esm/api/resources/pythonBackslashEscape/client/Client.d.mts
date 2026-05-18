import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { UserClient } from "../resources/user/client/Client.mjs";
export declare namespace PythonBackslashEscapeClient {
    type Options = BaseClientOptions;
}
export declare class PythonBackslashEscapeClient {
    protected readonly _options: NormalizedClientOptions<PythonBackslashEscapeClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: PythonBackslashEscapeClient.Options);
    get user(): UserClient;
}
