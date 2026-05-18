import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { ExamplesClient as ExamplesClient_ } from "../resources/examples/client/Client.mjs";
import { FileClient } from "../resources/file/client/Client.mjs";
import { HealthClient } from "../resources/health/client/Client.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
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
