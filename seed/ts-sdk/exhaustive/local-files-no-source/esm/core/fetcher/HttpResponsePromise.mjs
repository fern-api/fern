var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * A promise that returns the parsed response and lets you retrieve the raw response too.
 *
 * Supports fluent chaining for response processing:
 * - `.map(fn)` — transform the response data
 * - `.mapRaw(fn)` — transform with access to the raw response
 * - `.mapError(fn)` — intercept and rethrow errors (e.g. status-code discrimination)
 * - `.tap(fn)` — side effects without modifying the chain
 */
export class HttpResponsePromise extends Promise {
    constructor(promise) {
        // Initialize with a no-op to avoid premature parsing
        super((resolve) => {
            resolve(undefined);
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
    static fromFunction(fn, ...args) {
        return new HttpResponsePromise(fn(...args));
    }
    /**
     * Creates a function that returns an `HttpResponsePromise` from a function that returns a promise.
     *
     * @param fn - A function that returns a promise resolving to a `WithRawResponse` object.
     * @returns A function that returns an `HttpResponsePromise` instance.
     */
    static interceptFunction(fn) {
        return (...args) => {
            return HttpResponsePromise.fromPromise(fn(...args));
        };
    }
    /**
     * Creates an `HttpResponsePromise` from an existing promise.
     *
     * @param promise - A promise resolving to a `WithRawResponse` object.
     * @returns An `HttpResponsePromise` instance.
     */
    static fromPromise(promise) {
        return new HttpResponsePromise(promise);
    }
    /**
     * Creates an `HttpResponsePromise` from an executor function.
     *
     * @param executor - A function that takes resolve and reject callbacks to create a promise.
     * @returns An `HttpResponsePromise` instance.
     */
    static fromExecutor(executor) {
        const promise = new Promise(executor);
        return new HttpResponsePromise(promise);
    }
    /**
     * Creates an `HttpResponsePromise` from a resolved result.
     *
     * @param result - A `WithRawResponse` object to resolve immediately.
     * @returns An `HttpResponsePromise` instance.
     */
    static fromResult(result) {
        const promise = Promise.resolve(result);
        return new HttpResponsePromise(promise);
    }
    unwrap() {
        if (!this.unwrappedPromise) {
            this.unwrappedPromise = this.innerPromise.then(({ data }) => data);
        }
        return this.unwrappedPromise;
    }
    /** @inheritdoc */
    then(onfulfilled, onrejected) {
        return this.unwrap().then(onfulfilled, onrejected);
    }
    /** @inheritdoc */
    catch(onrejected) {
        return this.unwrap().catch(onrejected);
    }
    /** @inheritdoc */
    finally(onfinally) {
        return this.unwrap().finally(onfinally);
    }
    /**
     * Retrieves the data and raw response.
     *
     * @returns A promise resolving to a `WithRawResponse` object.
     */
    withRawResponse() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.innerPromise;
        });
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
    map(fn) {
        return new HttpResponsePromise(this.innerPromise.then((_a) => __awaiter(this, [_a], void 0, function* ({ data, rawResponse }) {
            return ({
                data: yield fn(data),
                rawResponse,
            });
        })));
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
    mapRaw(fn) {
        return new HttpResponsePromise(this.innerPromise.then((_a) => __awaiter(this, [_a], void 0, function* ({ data, rawResponse }) {
            return ({
                data: yield fn({ data, rawResponse }),
                rawResponse,
            });
        })));
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
    mapError(fn) {
        return new HttpResponsePromise(this.innerPromise.catch((error) => fn(error)));
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
    tap(fn) {
        return new HttpResponsePromise(this.innerPromise.then((result) => __awaiter(this, void 0, void 0, function* () {
            yield fn(result.data);
            return result;
        })));
    }
}
