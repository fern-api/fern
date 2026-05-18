import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { AutomationsClient } from "../resources/automations/client/Client.mjs";
import { ClassClient } from "../resources/class/client/Client.mjs";
export declare namespace PythonReservedKeywordSubpackagesClient {
    type Options = BaseClientOptions;
}
export declare class PythonReservedKeywordSubpackagesClient {
    protected readonly _options: NormalizedClientOptions<PythonReservedKeywordSubpackagesClient.Options>;
    protected _class: ClassClient | undefined;
    protected _automations: AutomationsClient | undefined;
    constructor(options: PythonReservedKeywordSubpackagesClient.Options);
    get class(): ClassClient;
    get automations(): AutomationsClient;
}
