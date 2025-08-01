/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as core from "../../../../core/index.js";
import * as SeedAnyAuth from "../../../index.js";
import { mergeHeaders, mergeOnlyDefinedHeaders } from "../../../../core/headers.js";
import * as errors from "../../../../errors/index.js";

export declare namespace Auth {
    export interface Options {
        environment: core.Supplier<string>;
        /** Specify a custom URL to connect the client to. */
        baseUrl?: core.Supplier<string>;
        token?: core.Supplier<core.BearerToken | undefined>;
        apiKey?: core.Supplier<string | undefined>;
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

export class Auth {
    protected readonly _options: Auth.Options;

    constructor(_options: Auth.Options) {
        this._options = _options;
    }

    /**
     * @param {SeedAnyAuth.GetTokenRequest} request
     * @param {Auth.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.auth.getToken({
     *         client_id: "client_id",
     *         client_secret: "client_secret",
     *         scope: "scope"
     *     })
     */
    public getToken(
        request: SeedAnyAuth.GetTokenRequest,
        requestOptions?: Auth.RequestOptions,
    ): core.HttpResponsePromise<SeedAnyAuth.TokenResponse> {
        return core.HttpResponsePromise.fromPromise(this.__getToken(request, requestOptions));
    }

    private async __getToken(
        request: SeedAnyAuth.GetTokenRequest,
        requestOptions?: Auth.RequestOptions,
    ): Promise<core.WithRawResponse<SeedAnyAuth.TokenResponse>> {
        const _response = await core.fetcher({
            url: core.url.join(
                (await core.Supplier.get(this._options.baseUrl)) ??
                    (await core.Supplier.get(this._options.environment)),
                "/token",
            ),
            method: "POST",
            headers: mergeHeaders(
                this._options?.headers,
                mergeOnlyDefinedHeaders({
                    Authorization: await this._getAuthorizationHeader(),
                    ...(await this._getCustomAuthorizationHeaders()),
                }),
                requestOptions?.headers,
            ),
            contentType: "application/json",
            queryParameters: requestOptions?.queryParams,
            requestType: "json",
            body: { ...request, audience: "https://api.example.com", grant_type: "client_credentials" },
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return { data: _response.body as SeedAnyAuth.TokenResponse, rawResponse: _response.rawResponse };
        }

        if (_response.error.reason === "status-code") {
            throw new errors.SeedAnyAuthError({
                statusCode: _response.error.statusCode,
                body: _response.error.body,
                rawResponse: _response.rawResponse,
            });
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.SeedAnyAuthError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                    rawResponse: _response.rawResponse,
                });
            case "timeout":
                throw new errors.SeedAnyAuthTimeoutError("Timeout exceeded when calling POST /token.");
            case "unknown":
                throw new errors.SeedAnyAuthError({
                    message: _response.error.errorMessage,
                    rawResponse: _response.rawResponse,
                });
        }
    }

    protected async _getAuthorizationHeader(): Promise<string | undefined> {
        const bearer = await core.Supplier.get(this._options.token);
        if (bearer != null) {
            return `Bearer ${bearer}`;
        }

        return undefined;
    }

    protected async _getCustomAuthorizationHeaders() {
        const apiKeyValue = (await core.Supplier.get(this._options.apiKey)) ?? process?.env["MY_API_KEY"];
        return { "X-API-Key": apiKeyValue };
    }
}
