import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { MultipleRequestBodiesClient as MultipleRequestBodiesClient_ } from "../resources/multipleRequestBodies/client/Client.js";
export declare namespace MultipleRequestBodiesClient {
    type Options = BaseClientOptions;
}
export declare class MultipleRequestBodiesClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<MultipleRequestBodiesClient.Options>;
    protected _multipleRequestBodies: MultipleRequestBodiesClient_ | undefined;
    constructor(options: MultipleRequestBodiesClient.Options);
    get multipleRequestBodies(): MultipleRequestBodiesClient_;
}
