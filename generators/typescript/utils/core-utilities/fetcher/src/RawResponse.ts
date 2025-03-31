/**
 * The raw response from the fetch call excluding the body.
 */
export type RawResponse = Omit<
    {
        [K in keyof Response as Response[K] extends Function ? never : K]: Response[K]; // strips out functions
    },
    "body" | "bodyUsed"
>; // strips out body and bodyUsed

/**
 * Converts a `Response` object into a `RawResponse` by extracting its properties,
 * excluding the `body` and `bodyUsed` fields.
 *
 * @param response - The `Response` object to convert.
 * @returns A `RawResponse` object containing the extracted properties of the input response.
 */
export function toRawResponse(response: Response): RawResponse {
    const { body, bodyUsed, ...rawResponse } = response;
    return rawResponse as RawResponse;
}

/**
 * A utility type that extends a function type `F` with an additional property `withRawResponse`.
 * The `withRawResponse` property is a function type `FRaw` that represents the same function
 * as `F` but with a different behavior or return type, typically used to provide access to raw
 * response data.
 *
 * @template F - The primary function type, which is a function returning a Promise.
 * @template FRaw - The extended function type, which is also a function returning a Promise.
 */
export type WithRawResponse<
    F extends (...args: any[]) => Promise<any>,
    FRaw extends (...args: any[]) => Promise<any>,
> = F & {
    withRawResponse: FRaw;
};
