/**
 * The raw response from the fetch call excluding the body.
 */
export type RawResponse = Omit<
    {
        [K in keyof Response as Response[K] extends Function ? never : K]: Response[K]; // strips out functions
    },
    "ok" | "body" | "bodyUsed"
>; // strips out body and bodyUsed

/**
 * A raw response indicating that the request was aborted.
 */
export const abortRawResponse: RawResponse = {
    headers: new Headers(),
    redirected: false,
    status: 499,
    statusText: "Client Closed Request",
    type: "error",
    url: ""
} as const;

/**
 * A raw response indicating an unknown error.
 */
export const unknownRawResponse: RawResponse = {
    headers: new Headers(),
    redirected: false,
    status: 0,
    statusText: "Unknown Error",
    type: "error",
    url: ""
} as const;

/**
 * Converts a `RawResponse` object into a `RawResponse` by extracting its properties,
 * excluding the `body` and `bodyUsed` fields.
 *
 * @param response - The `RawResponse` object to convert.
 * @returns A `RawResponse` object containing the extracted properties of the input response.
 */
export function toRawResponse(response: Response): RawResponse {
    const { body, bodyUsed, ok, ...rawResponse } = response;
    return rawResponse as RawResponse;
}

/**
 * Creates a `RawResponse` from a standard `Response` object.
 */
export interface WithRawResponse<T> {
    readonly data: T;
    readonly rawResponse: RawResponse;
}

/**
 * A promise that returns the parsed response and lets you retrieve the raw response too.
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
     * Creates a `ResponsePromise` from a function that returns a promise.
     *
     * @param fn - A function that returns a promise resolving to a `WithRawResponse` object.
     * @param args - Arguments to pass to the function.
     * @returns A `ResponsePromise` instance.
     */
    public static fromFunction<F extends (...args: never[]) => Promise<WithRawResponse<T>>, T>(
        fn: F,
        ...args: Parameters<F>
    ): HttpResponsePromise<T> {
        return new HttpResponsePromise<T>(fn(...args));
    }

    /**
     * Creates a `ResponsePromise` from an existing promise.
     *
     * @param promise - A promise resolving to a `WithRawResponse` object.
     * @returns A `ResponsePromise` instance.
     */
    public static fromPromise<T>(promise: Promise<WithRawResponse<T>>): HttpResponsePromise<T> {
        return new HttpResponsePromise<T>(promise);
    }

    /**
     * Creates a `ResponsePromise` from an executor function.
     *
     * @param executor - A function that takes resolve and reject callbacks to create a promise.
     * @returns A `ResponsePromise` instance.
     */
    public static fromExecutor<T>(
        executor: (resolve: (value: WithRawResponse<T>) => void, reject: (reason?: unknown) => void) => void
    ): HttpResponsePromise<T> {
        const promise = new Promise<WithRawResponse<T>>(executor);
        return new HttpResponsePromise<T>(promise);
    }

    /**
     * Creates a `ResponsePromise` from a resolved result.
     *
     * @param result - A `WithRawResponse` object to resolve immediately.
     * @returns A `ResponsePromise` instance.
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
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
        return this.unwrap().then(onfulfilled, onrejected);
    }

    /** @inheritdoc */
    public override catch<TResult = never>(
        onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null
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
}
