import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import * as SeedApi from "../../../index.mjs";
export declare namespace InlinedrequestsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class InlinedrequestsClient {
    protected readonly _options: NormalizedClientOptions<InlinedrequestsClient.Options>;
    constructor(options: InlinedrequestsClient.Options);
    /**
     * POST with custom object in request body, response is an object
     *
     * @param {SeedApi.InlinedRequestsPostWithObjectBodyandResponseRequest} request
     * @param {InlinedrequestsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.BadRequestError}
     *
     * @example
     *     await client.inlinedrequests.postwithobjectbodyandresponse({
     *         string: "string",
     *         integer: 1,
     *         NestedObject: {}
     *     })
     */
    postwithobjectbodyandresponse(request: SeedApi.InlinedRequestsPostWithObjectBodyandResponseRequest, requestOptions?: InlinedrequestsClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithOptionalField>;
    private __postwithobjectbodyandresponse;
}
