/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as core from "../../../../../../core/index.js";
import * as Fiddle from "../../../../../index.js";
import { mergeHeaders, mergeOnlyDefinedHeaders } from "../../../../../../core/headers.js";

export declare namespace Params {
    export interface Options {
        environment: core.Supplier<string>;
        /** Specify a custom URL to connect the client to. */
        baseUrl?: core.Supplier<string>;
        token?: core.Supplier<core.BearerToken | undefined>;
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

export class Params {
    protected readonly _options: Params.Options;

    constructor(_options: Params.Options) {
        this._options = _options;
    }

    /**
     * GET with path param
     *
     * @param {string} param
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithPath("param")
     */
    public getWithPath(
        param: string,
        requestOptions?: Params.RequestOptions,
    ): core.HttpResponsePromise<core.APIResponse<string, Fiddle.endpoints.params.getWithPath.Error>> {
        return core.HttpResponsePromise.fromPromise(this.__getWithPath(param, requestOptions));
    }

    private async __getWithPath(
        param: string,
        requestOptions?: Params.RequestOptions,
    ): Promise<core.WithRawResponse<core.APIResponse<string, Fiddle.endpoints.params.getWithPath.Error>>> {
        const _response = await core.fetcher({
            url: core.url.join(
                (await core.Supplier.get(this._options.baseUrl)) ??
                    (await core.Supplier.get(this._options.environment)),
                `/params/path/${encodeURIComponent(param)}`,
            ),
            method: "GET",
            headers: mergeHeaders(
                this._options?.headers,
                mergeOnlyDefinedHeaders({ Authorization: await this._getAuthorizationHeader() }),
                requestOptions?.headers,
            ),
            queryParameters: requestOptions?.queryParams,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                data: {
                    ok: true,
                    body: _response.body as string,
                    headers: _response.headers,
                    rawResponse: _response.rawResponse,
                },
                rawResponse: _response.rawResponse,
            };
        }

        return {
            data: {
                ok: false,
                error: Fiddle.endpoints.params.getWithPath.Error._unknown(_response.error),
                rawResponse: _response.rawResponse,
            },
            rawResponse: _response.rawResponse,
        };
    }

    /**
     * GET with path param
     *
     * @param {Fiddle.endpoints.GetWithInlinePath} request
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithInlinePath({
     *         param: "param"
     *     })
     */
    public getWithInlinePath(
        request: Fiddle.endpoints.GetWithInlinePath,
        requestOptions?: Params.RequestOptions,
    ): core.HttpResponsePromise<core.APIResponse<string, Fiddle.endpoints.params.getWithInlinePath.Error>> {
        return core.HttpResponsePromise.fromPromise(this.__getWithInlinePath(request, requestOptions));
    }

    private async __getWithInlinePath(
        request: Fiddle.endpoints.GetWithInlinePath,
        requestOptions?: Params.RequestOptions,
    ): Promise<core.WithRawResponse<core.APIResponse<string, Fiddle.endpoints.params.getWithInlinePath.Error>>> {
        const { param } = request;
        const _response = await core.fetcher({
            url: core.url.join(
                (await core.Supplier.get(this._options.baseUrl)) ??
                    (await core.Supplier.get(this._options.environment)),
                `/params/path/${encodeURIComponent(param)}`,
            ),
            method: "GET",
            headers: mergeHeaders(
                this._options?.headers,
                mergeOnlyDefinedHeaders({ Authorization: await this._getAuthorizationHeader() }),
                requestOptions?.headers,
            ),
            queryParameters: requestOptions?.queryParams,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                data: {
                    ok: true,
                    body: _response.body as string,
                    headers: _response.headers,
                    rawResponse: _response.rawResponse,
                },
                rawResponse: _response.rawResponse,
            };
        }

        return {
            data: {
                ok: false,
                error: Fiddle.endpoints.params.getWithInlinePath.Error._unknown(_response.error),
                rawResponse: _response.rawResponse,
            },
            rawResponse: _response.rawResponse,
        };
    }

    /**
     * GET with query param
     *
     * @param {Fiddle.endpoints.GetWithQuery} request
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithQuery({
     *         query: "query",
     *         number: 1
     *     })
     */
    public getWithQuery(
        request: Fiddle.endpoints.GetWithQuery,
        requestOptions?: Params.RequestOptions,
    ): core.HttpResponsePromise<core.APIResponse<void, Fiddle.endpoints.params.getWithQuery.Error>> {
        return core.HttpResponsePromise.fromPromise(this.__getWithQuery(request, requestOptions));
    }

    private async __getWithQuery(
        request: Fiddle.endpoints.GetWithQuery,
        requestOptions?: Params.RequestOptions,
    ): Promise<core.WithRawResponse<core.APIResponse<void, Fiddle.endpoints.params.getWithQuery.Error>>> {
        const { query, number: number_ } = request;
        const _queryParams: Record<string, string | string[] | object | object[] | null> = {};
        _queryParams["query"] = query;
        _queryParams["number"] = number_.toString();
        const _response = await core.fetcher({
            url: core.url.join(
                (await core.Supplier.get(this._options.baseUrl)) ??
                    (await core.Supplier.get(this._options.environment)),
                "/params",
            ),
            method: "GET",
            headers: mergeHeaders(
                this._options?.headers,
                mergeOnlyDefinedHeaders({ Authorization: await this._getAuthorizationHeader() }),
                requestOptions?.headers,
            ),
            queryParameters: { ..._queryParams, ...requestOptions?.queryParams },
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                data: {
                    ok: true,
                    body: undefined,
                    headers: _response.headers,
                    rawResponse: _response.rawResponse,
                },
                rawResponse: _response.rawResponse,
            };
        }

        return {
            data: {
                ok: false,
                error: Fiddle.endpoints.params.getWithQuery.Error._unknown(_response.error),
                rawResponse: _response.rawResponse,
            },
            rawResponse: _response.rawResponse,
        };
    }

    /**
     * GET with multiple of same query param
     *
     * @param {Fiddle.endpoints.GetWithMultipleQuery} request
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithAllowMultipleQuery({
     *         query: "query",
     *         number: 1
     *     })
     */
    public getWithAllowMultipleQuery(
        request: Fiddle.endpoints.GetWithMultipleQuery,
        requestOptions?: Params.RequestOptions,
    ): core.HttpResponsePromise<core.APIResponse<void, Fiddle.endpoints.params.getWithAllowMultipleQuery.Error>> {
        return core.HttpResponsePromise.fromPromise(this.__getWithAllowMultipleQuery(request, requestOptions));
    }

    private async __getWithAllowMultipleQuery(
        request: Fiddle.endpoints.GetWithMultipleQuery,
        requestOptions?: Params.RequestOptions,
    ): Promise<core.WithRawResponse<core.APIResponse<void, Fiddle.endpoints.params.getWithAllowMultipleQuery.Error>>> {
        const { query, number: number_ } = request;
        const _queryParams: Record<string, string | string[] | object | object[] | null> = {};
        if (Array.isArray(query)) {
            _queryParams["query"] = query.map((item) => item);
        } else {
            _queryParams["query"] = query;
        }

        if (Array.isArray(number_)) {
            _queryParams["number"] = number_.map((item) => item.toString());
        } else {
            _queryParams["number"] = number_.toString();
        }

        const _response = await core.fetcher({
            url: core.url.join(
                (await core.Supplier.get(this._options.baseUrl)) ??
                    (await core.Supplier.get(this._options.environment)),
                "/params",
            ),
            method: "GET",
            headers: mergeHeaders(
                this._options?.headers,
                mergeOnlyDefinedHeaders({ Authorization: await this._getAuthorizationHeader() }),
                requestOptions?.headers,
            ),
            queryParameters: { ..._queryParams, ...requestOptions?.queryParams },
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                data: {
                    ok: true,
                    body: undefined,
                    headers: _response.headers,
                    rawResponse: _response.rawResponse,
                },
                rawResponse: _response.rawResponse,
            };
        }

        return {
            data: {
                ok: false,
                error: Fiddle.endpoints.params.getWithAllowMultipleQuery.Error._unknown(_response.error),
                rawResponse: _response.rawResponse,
            },
            rawResponse: _response.rawResponse,
        };
    }

    /**
     * GET with path and query params
     *
     * @param {string} param
     * @param {Fiddle.endpoints.GetWithPathAndQuery} request
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithPathAndQuery("param", {
     *         query: "query"
     *     })
     */
    public getWithPathAndQuery(
        param: string,
        request: Fiddle.endpoints.GetWithPathAndQuery,
        requestOptions?: Params.RequestOptions,
    ): core.HttpResponsePromise<core.APIResponse<void, Fiddle.endpoints.params.getWithPathAndQuery.Error>> {
        return core.HttpResponsePromise.fromPromise(this.__getWithPathAndQuery(param, request, requestOptions));
    }

    private async __getWithPathAndQuery(
        param: string,
        request: Fiddle.endpoints.GetWithPathAndQuery,
        requestOptions?: Params.RequestOptions,
    ): Promise<core.WithRawResponse<core.APIResponse<void, Fiddle.endpoints.params.getWithPathAndQuery.Error>>> {
        const { query } = request;
        const _queryParams: Record<string, string | string[] | object | object[] | null> = {};
        _queryParams["query"] = query;
        const _response = await core.fetcher({
            url: core.url.join(
                (await core.Supplier.get(this._options.baseUrl)) ??
                    (await core.Supplier.get(this._options.environment)),
                `/params/path-query/${encodeURIComponent(param)}`,
            ),
            method: "GET",
            headers: mergeHeaders(
                this._options?.headers,
                mergeOnlyDefinedHeaders({ Authorization: await this._getAuthorizationHeader() }),
                requestOptions?.headers,
            ),
            queryParameters: { ..._queryParams, ...requestOptions?.queryParams },
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                data: {
                    ok: true,
                    body: undefined,
                    headers: _response.headers,
                    rawResponse: _response.rawResponse,
                },
                rawResponse: _response.rawResponse,
            };
        }

        return {
            data: {
                ok: false,
                error: Fiddle.endpoints.params.getWithPathAndQuery.Error._unknown(_response.error),
                rawResponse: _response.rawResponse,
            },
            rawResponse: _response.rawResponse,
        };
    }

    /**
     * GET with path and query params
     *
     * @param {Fiddle.endpoints.GetWithInlinePathAndQuery} request
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithInlinePathAndQuery({
     *         param: "param",
     *         query: "query"
     *     })
     */
    public getWithInlinePathAndQuery(
        request: Fiddle.endpoints.GetWithInlinePathAndQuery,
        requestOptions?: Params.RequestOptions,
    ): core.HttpResponsePromise<core.APIResponse<void, Fiddle.endpoints.params.getWithInlinePathAndQuery.Error>> {
        return core.HttpResponsePromise.fromPromise(this.__getWithInlinePathAndQuery(request, requestOptions));
    }

    private async __getWithInlinePathAndQuery(
        request: Fiddle.endpoints.GetWithInlinePathAndQuery,
        requestOptions?: Params.RequestOptions,
    ): Promise<core.WithRawResponse<core.APIResponse<void, Fiddle.endpoints.params.getWithInlinePathAndQuery.Error>>> {
        const { param, query } = request;
        const _queryParams: Record<string, string | string[] | object | object[] | null> = {};
        _queryParams["query"] = query;
        const _response = await core.fetcher({
            url: core.url.join(
                (await core.Supplier.get(this._options.baseUrl)) ??
                    (await core.Supplier.get(this._options.environment)),
                `/params/path-query/${encodeURIComponent(param)}`,
            ),
            method: "GET",
            headers: mergeHeaders(
                this._options?.headers,
                mergeOnlyDefinedHeaders({ Authorization: await this._getAuthorizationHeader() }),
                requestOptions?.headers,
            ),
            queryParameters: { ..._queryParams, ...requestOptions?.queryParams },
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                data: {
                    ok: true,
                    body: undefined,
                    headers: _response.headers,
                    rawResponse: _response.rawResponse,
                },
                rawResponse: _response.rawResponse,
            };
        }

        return {
            data: {
                ok: false,
                error: Fiddle.endpoints.params.getWithInlinePathAndQuery.Error._unknown(_response.error),
                rawResponse: _response.rawResponse,
            },
            rawResponse: _response.rawResponse,
        };
    }

    /**
     * PUT to update with path param
     *
     * @param {string} param
     * @param {string} request
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.modifyWithPath("param", "string")
     */
    public modifyWithPath(
        param: string,
        request: string,
        requestOptions?: Params.RequestOptions,
    ): core.HttpResponsePromise<core.APIResponse<string, Fiddle.endpoints.params.modifyWithPath.Error>> {
        return core.HttpResponsePromise.fromPromise(this.__modifyWithPath(param, request, requestOptions));
    }

    private async __modifyWithPath(
        param: string,
        request: string,
        requestOptions?: Params.RequestOptions,
    ): Promise<core.WithRawResponse<core.APIResponse<string, Fiddle.endpoints.params.modifyWithPath.Error>>> {
        const _response = await core.fetcher({
            url: core.url.join(
                (await core.Supplier.get(this._options.baseUrl)) ??
                    (await core.Supplier.get(this._options.environment)),
                `/params/path/${encodeURIComponent(param)}`,
            ),
            method: "PUT",
            headers: mergeHeaders(
                this._options?.headers,
                mergeOnlyDefinedHeaders({ Authorization: await this._getAuthorizationHeader() }),
                requestOptions?.headers,
            ),
            contentType: "application/json",
            queryParameters: requestOptions?.queryParams,
            requestType: "json",
            body: request,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                data: {
                    ok: true,
                    body: _response.body as string,
                    headers: _response.headers,
                    rawResponse: _response.rawResponse,
                },
                rawResponse: _response.rawResponse,
            };
        }

        return {
            data: {
                ok: false,
                error: Fiddle.endpoints.params.modifyWithPath.Error._unknown(_response.error),
                rawResponse: _response.rawResponse,
            },
            rawResponse: _response.rawResponse,
        };
    }

    /**
     * PUT to update with path param
     *
     * @param {Fiddle.endpoints.ModifyResourceAtInlinedPath} request
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.modifyWithInlinePath({
     *         param: "param",
     *         body: "string"
     *     })
     */
    public modifyWithInlinePath(
        request: Fiddle.endpoints.ModifyResourceAtInlinedPath,
        requestOptions?: Params.RequestOptions,
    ): core.HttpResponsePromise<core.APIResponse<string, Fiddle.endpoints.params.modifyWithInlinePath.Error>> {
        return core.HttpResponsePromise.fromPromise(this.__modifyWithInlinePath(request, requestOptions));
    }

    private async __modifyWithInlinePath(
        request: Fiddle.endpoints.ModifyResourceAtInlinedPath,
        requestOptions?: Params.RequestOptions,
    ): Promise<core.WithRawResponse<core.APIResponse<string, Fiddle.endpoints.params.modifyWithInlinePath.Error>>> {
        const { param, body: _body } = request;
        const _response = await core.fetcher({
            url: core.url.join(
                (await core.Supplier.get(this._options.baseUrl)) ??
                    (await core.Supplier.get(this._options.environment)),
                `/params/path/${encodeURIComponent(param)}`,
            ),
            method: "PUT",
            headers: mergeHeaders(
                this._options?.headers,
                mergeOnlyDefinedHeaders({ Authorization: await this._getAuthorizationHeader() }),
                requestOptions?.headers,
            ),
            contentType: "application/json",
            queryParameters: requestOptions?.queryParams,
            requestType: "json",
            body: _body,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                data: {
                    ok: true,
                    body: _response.body as string,
                    headers: _response.headers,
                    rawResponse: _response.rawResponse,
                },
                rawResponse: _response.rawResponse,
            };
        }

        return {
            data: {
                ok: false,
                error: Fiddle.endpoints.params.modifyWithInlinePath.Error._unknown(_response.error),
                rawResponse: _response.rawResponse,
            },
            rawResponse: _response.rawResponse,
        };
    }

    protected async _getAuthorizationHeader(): Promise<string | undefined> {
        const bearer = await core.Supplier.get(this._options.token);
        if (bearer != null) {
            return `Bearer ${bearer}`;
        }

        return undefined;
    }
}
