import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace PropertyAccessClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PropertyAccessClient {
    protected readonly _options: NormalizedClientOptions<PropertyAccessClient.Options>;
    constructor(options: PropertyAccessClient.Options);
    /**
     * @param {SeedApi.propertyAccess.User} request
     * @param {PropertyAccessClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.propertyAccess.propertyAccess.createUser({
     *         id: "id",
     *         email: "email",
     *         password: "password",
     *         profile: {
     *             name: "name",
     *             verification: {
     *                 verified: "verified"
     *             },
     *             ssn: "ssn"
     *         }
     *     })
     */
    createUser(request: SeedApi.propertyAccess.User, requestOptions?: PropertyAccessClient.RequestOptions): core.HttpResponsePromise<SeedApi.propertyAccess.User>;
    private __createUser;
}
