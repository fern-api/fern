import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace CsharpSystemCollisionClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class CsharpSystemCollisionClient {
    protected readonly _options: NormalizedClientOptions<CsharpSystemCollisionClient.Options>;
    constructor(options: CsharpSystemCollisionClient.Options);
    /**
     * @param {SeedApi.csharpSystemCollision.User} request
     * @param {CsharpSystemCollisionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.csharpSystemCollision.csharpSystemCollision.createUser({
     *         line1: "line1",
     *         city: "city",
     *         state: "state",
     *         zip: "zip",
     *         country: "USA"
     *     })
     */
    createUser(request: SeedApi.csharpSystemCollision.User, requestOptions?: CsharpSystemCollisionClient.RequestOptions): core.HttpResponsePromise<SeedApi.csharpSystemCollision.User>;
    private __createUser;
    /**
     * @param {SeedApi.csharpSystemCollision.Task} request
     * @param {CsharpSystemCollisionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.csharpSystemCollision.csharpSystemCollision.createTask({
     *         name: "name",
     *         user: {
     *             line1: "line1",
     *             city: "city",
     *             state: "state",
     *             zip: "zip",
     *             country: "USA"
     *         }
     *     })
     */
    createTask(request: SeedApi.csharpSystemCollision.Task, requestOptions?: CsharpSystemCollisionClient.RequestOptions): core.HttpResponsePromise<SeedApi.csharpSystemCollision.Task>;
    private __createTask;
    /**
     * @param {SeedApi.csharpSystemCollision.Task} request
     * @param {CsharpSystemCollisionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.csharpSystemCollision.csharpSystemCollision.emptyResponse({
     *         name: "name",
     *         user: {
     *             line1: "line1",
     *             city: "city",
     *             state: "state",
     *             zip: "zip",
     *             country: "USA"
     *         }
     *     })
     */
    emptyResponse(request: SeedApi.csharpSystemCollision.Task, requestOptions?: CsharpSystemCollisionClient.RequestOptions): core.HttpResponsePromise<void>;
    private __emptyResponse;
}
