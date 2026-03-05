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
export class HttpResponsePromise<T> extends Promise<T> {
    private innerPromise: Promise<WithRawResponse<T>>;
    private unwrappedPromise: Promise<T> | undefined;

    private constructor(promise: Promise<WithRawResponse<T>>) {
        // Initialize with a no-op to avoid premature parsing
        super((resolve) => {
            resolve(undefined as unknown as T);
        });
        this.innerPromise = promise;
    }

    /**
     * Creates an `HttpResponsePromise` from a function that returns a promise.
     *
     * @param fn - A function that returns a promise resolving to a `WithRawResponse` object.
     * @param args - Arguments to pass to the function.
     * @returns An `HttpResponsePromise` instance.
     */
    public static fromFunction<F extends (...args: never[]) => Promise<WithRawResponse<T>>, T>(
        fn: F,
        ...args: Parameters<F>
    ): HttpResponsePromise<T> {
        return new HttpResponsePromise<T>(fn(...args));
    }

    /**
     * Creates a function that returns an `HttpResponsePromise` from a function that returns a promise.
     *
     * @param fn - A function that returns a promise resolving to a `WithRawResponse` object.
     * @returns A function that returns an `HttpResponsePromise` instance.
     */
    public static interceptFunction<
        F extends (...args: never[]) => Promise<WithRawResponse<T>>,
        T = Awaited<ReturnType<F>>["data"],
    >(fn: F): (...args: Parameters<F>) => HttpResponsePromise<T> {
        return (...args: Parameters<F>): HttpResponsePromise<T> => {
            return HttpResponsePromise.fromPromise<T>(fn(...args));
        };
    }

    /**
     * Creates an `HttpResponsePromise` from an existing promise.
     *
     * @param promise - A promise resolving to a `WithRawResponse` object.
     * @returns An `HttpResponsePromise` instance.
     */
    public static fromPromise<T>(promise: Promise<WithRawResponse<T>>): HttpResponsePromise<T> {
        return new HttpResponsePromise<T>(promise);
    }

    /**
     * Creates an `HttpResponsePromise` from an executor function.
     *
     * @param executor - A function that takes resolve and reject callbacks to create a promise.
     * @returns An `HttpResponsePromise` instance.
     */
    public static fromExecutor<T>(
        executor: (resolve: (value: WithRawResponse<T>) => void, reject: (reason?: unknown) => void) => void,
    ): HttpResponsePromise<T> {
        const promise = new Promise<WithRawResponse<T>>(executor);
        return new HttpResponsePromise<T>(promise);
    }

    /**
     * Creates an `HttpResponsePromise` from a resolved result.
     *
     * @param result - A `WithRawResponse` object to resolve immediately.
     * @returns An `HttpResponsePromise` instance.
     */
    public static fromResult<T>(result: WithRawResponse<T>): HttpResponsePromise<T> {
        const promise = Promise.resolve(result);
        return new HttpResponsePromise<T>(promise);
    }

    private unwrap(): Promise<T> {
        if (!this.unwrappedPromise) {
            this.unwrappedPromise = this.innerPromise.then(({ data }) => data);
        }
        return this.unwrappedPromise;
    }

    /** @inheritdoc */
    public override then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> {
        return this.unwrap().then(onfulfilled, onrejected);
    }

    /** @inheritdoc */
    public override catch<TResult = never>(
        onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
    ): Promise<T | TResult> {
        return this.unwrap().catch(onrejected);
    }

    /** @inheritdoc */
    public override finally(onfinally?: (() => void) | null): Promise<T> {
        return this.unwrap().finally(onfinally);
    }

    /**
     * Retrieves the data and raw response.
     *
     * @returns A promise resolving to a `WithRawResponse` object.
     */
    public async withRawResponse(): Promise<WithRawResponse<T>> {
        return await this.innerPromise;
    }

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
    public map<U>(fn: (data: T) => U | Promise<U>): HttpResponsePromise<U> {
        return new HttpResponsePromise<U>(
            this.innerPromise.then(async ({ data, rawResponse }) => ({
                data: await fn(data),
                rawResponse,
            })),
        );
    }

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
    public mapRaw<U>(fn: (result: { data: T; rawResponse: RawResponse }) => U | Promise<U>): HttpResponsePromise<U> {
        return new HttpResponsePromise<U>(
            this.innerPromise.then(async ({ data, rawResponse }) => ({
                data: await fn({ data, rawResponse }),
                rawResponse,
            })),
        );
    }

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
    public mapError(fn: (error: unknown) => never): HttpResponsePromise<T> {
        return new HttpResponsePromise<T>(
            this.innerPromise.catch((error: unknown) => fn(error)),
        );
    }

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
    public tap(fn: (data: T) => void | Promise<void>): HttpResponsePromise<T> {
        return new HttpResponsePromise<T>(
            this.innerPromise.then(async (result) => {
                await fn(result.data);
                return result;
            }),
        );
    }
}
