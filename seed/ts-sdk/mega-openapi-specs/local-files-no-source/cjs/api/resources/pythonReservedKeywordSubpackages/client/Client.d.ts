import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { AutomationsClient } from "../resources/automations/client/Client.js";
import { ClassClient } from "../resources/class/client/Client.js";
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
