/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as core from "./core/index.js";
import { mergeHeaders } from "./core/headers.js";
import { PropertyBasedError } from "./api/resources/propertyBasedError/client/Client.js";

export declare namespace SeedErrorPropertyClient {
    export interface Options {
        environment: core.Supplier<string>;
        /** Specify a custom URL to connect the client to. */
        baseUrl?: core.Supplier<string>;
        /** Additional headers to include in requests. */
        headers?: Record<string, string | core.Supplier<string | undefined> | undefined>;
    }

    export interface RequestOptions {
        /** The maximum time to wait for a response in seconds. */
        timeoutInSeconds?: number;
        /** The number of times to retry the request. Defaults to 2. */
        maxRetries?: number;
        /** A hook to abort the request. */
        abortSignal?: AbortSignal;
        /** Additional query string parameters to include in the request. */
        queryParams?: Record<string, unknown>;
        /** Additional headers to include in the request. */
        headers?: Record<string, string | core.Supplier<string | undefined> | undefined>;
    }
}

export class SeedErrorPropertyClient {
    protected readonly _options: SeedErrorPropertyClient.Options;
    protected _propertyBasedError: PropertyBasedError | undefined;

    constructor(_options: SeedErrorPropertyClient.Options) {
        this._options = {
            ..._options,
            headers: mergeHeaders(
                {
                    "X-Fern-Language": "JavaScript",
                    "X-Fern-SDK-Name": "@fern/error-property",
                    "X-Fern-SDK-Version": "0.0.1",
                    "User-Agent": "@fern/error-property/0.0.1",
                    "X-Fern-Runtime": core.RUNTIME.type,
                    "X-Fern-Runtime-Version": core.RUNTIME.version,
                },
                _options?.headers,
            ),
        };
    }

    public get propertyBasedError(): PropertyBasedError {
        return (this._propertyBasedError ??= new PropertyBasedError(this._options));
    }
}
