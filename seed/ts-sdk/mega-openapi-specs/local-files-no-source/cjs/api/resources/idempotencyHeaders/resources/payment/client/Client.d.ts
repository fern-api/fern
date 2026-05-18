import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace PaymentClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PaymentClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<PaymentClient.Options>;
    constructor(options: PaymentClient.Options);
    /**
     * @param {SeedApi.idempotencyHeaders.CreatePaymentRequest} request
     * @param {PaymentClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.idempotencyHeaders.payment.create({
     *         amount: 1,
     *         currency: "USD"
     *     })
     */
    create(request: SeedApi.idempotencyHeaders.CreatePaymentRequest, requestOptions?: PaymentClient.RequestOptions): core.HttpResponsePromise<string>;
    private __create;
    /**
     * @param {SeedApi.idempotencyHeaders.DeletePaymentRequest} request
     * @param {PaymentClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.idempotencyHeaders.payment.delete({
     *         paymentId: "paymentId"
     *     })
     */
    delete(request: SeedApi.idempotencyHeaders.DeletePaymentRequest, requestOptions?: PaymentClient.RequestOptions): core.HttpResponsePromise<void>;
    private __delete;
}
