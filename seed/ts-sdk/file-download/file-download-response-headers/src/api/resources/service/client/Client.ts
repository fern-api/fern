/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as core from "../../../../core/index.js";
import { mergeHeaders } from "../../../../core/headers.js";
import * as errors from "../../../../errors/index.js";

export declare namespace Service {
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

export class Service {
    protected readonly _options: Service.Options;

    constructor(_options: Service.Options) {
        this._options = _options;
    }

    /**
     * @param {Service.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.service.simple()
     */
    public simple(requestOptions?: Service.RequestOptions): core.HttpResponsePromise<void> {
        return core.HttpResponsePromise.fromPromise(this.__simple(requestOptions));
    }

    private async __simple(requestOptions?: Service.RequestOptions): Promise<core.WithRawResponse<void>> {
        const _response = await core.fetcher({
            url: core.url.join(
                (await core.Supplier.get(this._options.baseUrl)) ??
                    (await core.Supplier.get(this._options.environment)),
                "/snippet",
            ),
            method: "POST",
            headers: mergeHeaders(this._options?.headers, requestOptions?.headers),
            queryParameters: requestOptions?.queryParams,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return { data: undefined, rawResponse: _response.rawResponse };
        }

        if (_response.error.reason === "status-code") {
            throw new errors.SeedFileDownloadError({
                statusCode: _response.error.statusCode,
                body: _response.error.body,
                rawResponse: _response.rawResponse,
            });
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.SeedFileDownloadError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                    rawResponse: _response.rawResponse,
                });
            case "timeout":
                throw new errors.SeedFileDownloadTimeoutError("Timeout exceeded when calling POST /snippet.");
            case "unknown":
                throw new errors.SeedFileDownloadError({
                    message: _response.error.errorMessage,
                    rawResponse: _response.rawResponse,
                });
        }
    }

    public downloadFile(requestOptions?: Service.RequestOptions): core.HttpResponsePromise<{
        data: core.BinaryResponse;
        contentLengthInBytes?: number;
        contentType?: string;
    }> {
        return core.HttpResponsePromise.fromPromise(this.__downloadFile(requestOptions));
    }

    private async __downloadFile(requestOptions?: Service.RequestOptions): Promise<
        core.WithRawResponse<{
            data: core.BinaryResponse;
            contentLengthInBytes?: number;
            contentType?: string;
        }>
    > {
        const _response = await core.fetcher<core.BinaryResponse>({
            url:
                (await core.Supplier.get(this._options.baseUrl)) ??
                (await core.Supplier.get(this._options.environment)),
            method: "POST",
            headers: mergeHeaders(this._options?.headers, requestOptions?.headers),
            queryParameters: requestOptions?.queryParams,
            responseType: "binary-response",
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            const _contentLength = core.getHeader(_response.headers ?? {}, "Content-Length");
            return {
                data: {
                    data: _response.body,
                    contentLengthInBytes: _contentLength != null ? Number(_contentLength) : undefined,
                    contentType: core.getHeader(_response.headers ?? {}, "Content-Type"),
                },
                rawResponse: _response.rawResponse,
            };
        }

        if (_response.error.reason === "status-code") {
            throw new errors.SeedFileDownloadError({
                statusCode: _response.error.statusCode,
                body: _response.error.body,
                rawResponse: _response.rawResponse,
            });
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.SeedFileDownloadError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                    rawResponse: _response.rawResponse,
                });
            case "timeout":
                throw new errors.SeedFileDownloadTimeoutError("Timeout exceeded when calling POST /.");
            case "unknown":
                throw new errors.SeedFileDownloadError({
                    message: _response.error.errorMessage,
                    rawResponse: _response.rawResponse,
                });
        }
    }
}
