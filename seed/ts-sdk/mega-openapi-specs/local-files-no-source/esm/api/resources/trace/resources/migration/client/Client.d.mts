import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace MigrationClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class MigrationClient {
    protected readonly _options: NormalizedClientOptions<MigrationClient.Options>;
    constructor(options: MigrationClient.Options);
    /**
     * @param {SeedApi.trace.GetAttemptedMigrationsMigrationRequest} request
     * @param {MigrationClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.migration.getAttemptedMigrations({
     *         "admin-key-header": "admin-key-header"
     *     })
     */
    getAttemptedMigrations(request: SeedApi.trace.GetAttemptedMigrationsMigrationRequest, requestOptions?: MigrationClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.Migration[]>;
    private __getAttemptedMigrations;
}
