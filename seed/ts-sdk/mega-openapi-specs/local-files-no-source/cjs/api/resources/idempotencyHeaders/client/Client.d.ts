import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { PaymentClient } from "../resources/payment/client/Client.js";
export declare namespace IdempotencyHeadersClient {
    type Options = BaseClientOptions;
}
export declare class IdempotencyHeadersClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<IdempotencyHeadersClient.Options>;
    protected _payment: PaymentClient | undefined;
    constructor(options: IdempotencyHeadersClient.Options);
    get payment(): PaymentClient;
}
