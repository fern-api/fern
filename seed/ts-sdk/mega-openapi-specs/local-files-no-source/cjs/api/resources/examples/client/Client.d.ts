import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { ExamplesClient as ExamplesClient_ } from "../resources/examples/client/Client.js";
import { FileClient } from "../resources/file/client/Client.js";
import { HealthClient } from "../resources/health/client/Client.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace ExamplesClient {
    type Options = BaseClientOptions;
}
export declare class ExamplesClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ExamplesClient.Options>;
    protected _examples: ExamplesClient_ | undefined;
    protected _service: ServiceClient | undefined;
    protected _file: FileClient | undefined;
    protected _health: HealthClient | undefined;
    constructor(options: ExamplesClient.Options);
    get examples(): ExamplesClient_;
    get service(): ServiceClient;
    get file(): FileClient;
    get health(): HealthClient;
}
