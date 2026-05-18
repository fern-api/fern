import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace ConversationsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ConversationsClient {
    protected readonly _options: NormalizedClientOptions<ConversationsClient.Options>;
    constructor(options: ConversationsClient.Options);
    /**
     * Place an outbound call or validate call setup with dry_run.
     *
     * @param {SeedApi.nullType.OutboundCallConversationsRequest} request
     * @param {ConversationsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullType.conversations.outboundCall({
     *         to_phone_number: "to_phone_number"
     *     })
     */
    outboundCall(request: SeedApi.nullType.OutboundCallConversationsRequest, requestOptions?: ConversationsClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullType.OutboundCallConversationsResponse>;
    private __outboundCall;
}
