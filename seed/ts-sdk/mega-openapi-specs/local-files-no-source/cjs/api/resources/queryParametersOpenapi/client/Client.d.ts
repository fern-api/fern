import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import type * as SeedApi from "../../../index.js";
export declare namespace QueryParametersOpenapiClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class QueryParametersOpenapiClient {
    protected readonly _options: NormalizedClientOptions<QueryParametersOpenapiClient.Options>;
    constructor(options: QueryParametersOpenapiClient.Options);
    /**
     * @param {SeedApi.queryParametersOpenapi.SearchRequest} request
     * @param {QueryParametersOpenapiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.queryParametersOpenapi.search({
     *         limit: 1,
     *         id: "id",
     *         date: "2023-01-15",
     *         deadline: "2024-01-15T09:30:00Z",
     *         bytes: "bytes",
     *         user: {
     *             name: "name",
     *             tags: ["tags", "tags"]
     *         },
     *         userList: {
     *             name: "name",
     *             tags: ["tags", "tags"]
     *         },
     *         optionalDeadline: "2024-01-15T09:30:00Z",
     *         keyValue: {
     *             "keyValue": "keyValue"
     *         },
     *         optionalString: "optionalString",
     *         nestedUser: {
     *             name: "name",
     *             user: {
     *                 name: "name",
     *                 tags: ["tags", "tags"]
     *             }
     *         },
     *         optionalUser: {
     *             name: "name",
     *             tags: ["tags", "tags"]
     *         },
     *         excludeUser: {
     *             name: "name",
     *             tags: ["tags", "tags"]
     *         },
     *         filter: "filter",
     *         tags: "tags",
     *         optionalTags: "optionalTags",
     *         neighbor: {
     *             name: "name",
     *             tags: ["tags", "tags"]
     *         },
     *         neighborRequired: {
     *             name: "name",
     *             tags: ["tags", "tags"]
     *         }
     *     })
     */
    search(request: SeedApi.queryParametersOpenapi.SearchRequest, requestOptions?: QueryParametersOpenapiClient.RequestOptions): core.HttpResponsePromise<SeedApi.queryParametersOpenapi.SearchResponse>;
    private __search;
}
