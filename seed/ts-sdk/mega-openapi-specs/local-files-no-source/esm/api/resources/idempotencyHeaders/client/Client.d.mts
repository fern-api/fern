import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { PaymentClient } from "../resources/payment/client/Client.mjs";
export declare namespace IdempotencyHeadersClient {
    type Options = BaseClientOptions;
}
export declare class IdempotencyHeadersClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<IdempotencyHeadersClient.Options>;
    protected _payment: PaymentClient | undefined;
    constructor(options: IdempotencyHeadersClient.Options);
    get payment(): PaymentClient;
}
