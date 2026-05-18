import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { MultipleRequestBodiesClient as MultipleRequestBodiesClient_ } from "../resources/multipleRequestBodies/client/Client.mjs";
export declare namespace MultipleRequestBodiesClient {
    type Options = BaseClientOptions;
}
export declare class MultipleRequestBodiesClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<MultipleRequestBodiesClient.Options>;
    protected _multipleRequestBodies: MultipleRequestBodiesClient_ | undefined;
    constructor(options: MultipleRequestBodiesClient.Options);
    get multipleRequestBodies(): MultipleRequestBodiesClient_;
}
