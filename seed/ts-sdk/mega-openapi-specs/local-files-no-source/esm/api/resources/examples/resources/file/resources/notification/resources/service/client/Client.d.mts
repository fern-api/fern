import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../../../BaseClient.mjs";
import * as core from "../../../../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../../../../index.mjs";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * @param {SeedApi.examples.file.notification.GetExceptionServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.examples.file.notification.service.getException({
     *         notificationId: "notification-hsy129x"
     *     })
     */
    getException(request: SeedApi.examples.file.notification.GetExceptionServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.examples.Exception>;
    private __getException;
}
