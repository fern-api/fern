import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { PythonPositionalSinglePropertyClient as PythonPositionalSinglePropertyClient_ } from "../resources/pythonPositionalSingleProperty/client/Client.js";
export declare namespace PythonPositionalSinglePropertyClient {
    type Options = BaseClientOptions;
}
export declare class PythonPositionalSinglePropertyClient {
    protected readonly _options: NormalizedClientOptions<PythonPositionalSinglePropertyClient.Options>;
    protected _pythonPositionalSingleProperty: PythonPositionalSinglePropertyClient_ | undefined;
    constructor(options: PythonPositionalSinglePropertyClient.Options);
    get pythonPositionalSingleProperty(): PythonPositionalSinglePropertyClient_;
}
