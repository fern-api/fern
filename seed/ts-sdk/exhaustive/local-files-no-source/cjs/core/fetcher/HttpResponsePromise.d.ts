import type { RawResponse, WithRawResponse } from "./RawResponse.js";
/**
 * A promise that returns the parsed response and lets you retrieve the raw response too.
 *
 * Supports fluent chaining for response processing:
 * - `.map(fn)` — transform the response data
 * - `.mapRaw(fn)` — transform with access to the raw response
 * - `.mapError(fn)` — intercept and rethrow errors (e.g. status-code discrimination)
 * - `.tap(fn)` — side effects without modifying the chain
 */
export declare class HttpResponsePromise<T> extends Promise<T> {
    private innerPromise;
    private unwrappedPromise;
    private constructor();
    /**
     * Creates an `HttpResponsePromise` from a function that returns a promise.
     *
     * @param fn - A function that returns a promise resolving to a `WithRawResponse` object.
     * @param args - Arguments to pass to the function.
     * @returns An `HttpResponsePromise` instance.
     */
    static fromFunction<F extends (...args: never[]) => Promise<WithRawResponse<T>>, T>(fn: F, ...args: Parameters<F>): HttpResponsePromise<T>;
    /**
     * Creates a function that returns an `HttpResponsePromise` from a function that returns a promise.
     *
     * @param fn - A function that returns a promise resolving to a `WithRawResponse` object.
     * @returns A function that returns an `HttpResponsePromise` instance.
     */
    static interceptFunction<F extends (...args: never[]) => Promise<WithRawResponse<T>>, T = Awaited<ReturnType<F>>["data"]>(fn: F): (...args: Parameters<F>) => HttpResponsePromise<T>;
    /**
     * Creates an `HttpResponsePromise` from an existing promise.
     *
     * @param promise - A promise resolving to a `WithRawResponse` object.
     * @returns An `HttpResponsePromise` instance.
     */
    static fromPromise<T>(promise: Promise<WithRawResponse<T>>): HttpResponsePromise<T>;
    /**
     * Creates an `HttpResponsePromise` from an executor function.
     *
     * @param executor - A function that takes resolve and reject callbacks to create a promise.
     * @returns An `HttpResponsePromise` instance.
     */
    static fromExecutor<T>(executor: (resolve: (value: WithRawResponse<T>) => void, reject: (reason?: unknown) => void) => void): HttpResponsePromise<T>;
    /**
     * Creates an `HttpResponsePromise` from a resolved result.
     *
     * @param result - A `WithRawResponse` object to resolve immediately.
     * @returns An `HttpResponsePromise` instance.
     */
    static fromResult<T>(result: WithRawResponse<T>): HttpResponsePromise<T>;
    private unwrap;
    /** @inheritdoc */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2>;
    /** @inheritdoc */
    catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null): Promise<T | TResult>;
    /** @inheritdoc */
    finally(onfinally?: (() => void) | null): Promise<T>;
    /**
     * Retrieves the data and raw response.
     *
     * @returns A promise resolving to a `WithRawResponse` object.
     */
    withRawResponse(): Promise<WithRawResponse<T>>;
    /**
     * Transforms the response data while preserving the raw response.
     * Returns a new `HttpResponsePromise` with the transformed data type.
     *
     * @example
     * ```typescript
     * return this._requestFn<unknown>({ method: "GET", path: "/users/me", requestOptions })
     *     .map((body) => serializers.User.parseOrThrow(body));
     * ```
     */
    map<U>(fn: (data: T) => U | Promise<U>): HttpResponsePromise<U>;
    /**
     * Transforms the response data with access to the raw response.
     * Returns a new `HttpResponsePromise` with the transformed data type.
     *
     * @example
     * ```typescript
     * return this._requestFn<unknown>({ method: "GET", path: "/users", requestOptions })
     *     .mapRaw(({ data, rawResponse }) => ({
     *         users: data as User[],
     *         requestId: rawResponse.headers.get("x-request-id"),
     *     }));
     * ```
     */
    mapRaw<U>(fn: (result: {
        data: T;
        rawResponse: RawResponse;
    }) => U | Promise<U>): HttpResponsePromise<U>;
    /**
     * Intercepts errors and optionally rethrows them as different error types.
     * The callback receives the caught error and should either throw a new error or rethrow the original.
     * Returns a new `HttpResponsePromise` preserving the same data type.
     *
     * @example
     * ```typescript
     * return this._requestFn<Movie>({ method: "GET", path: `/movies/${id}`, requestOptions })
     *     .mapError((error) => {
     *         if (error instanceof errors.SeedApiError && error.statusCode === 404) {
     *             throw new MovieDoesNotExistError(error.body, error.rawResponse);
     *         }
     *         throw error;
     *     });
     * ```
     */
    mapError(fn: (error: unknown) => never): HttpResponsePromise<T>;
    /**
     * Executes a side-effect function with the response data without modifying the chain.
     * Useful for logging, telemetry, caching, etc.
     * Returns the same `HttpResponsePromise` with the original data type.
     *
     * @example
     * ```typescript
     * return this._requestFn<User>({ method: "GET", path: "/users/me", requestOptions })
     *     .tap((data) => console.log("Got user:", data.id));
     * ```
     */
    tap(fn: (data: T) => void | Promise<void>): HttpResponsePromise<T>;
}
