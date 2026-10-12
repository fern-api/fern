export type ResponseBodyError = {
    ok: false;
    error: {
        reason: "non-json";
        statusCode: number;
        rawBody: string;
    } | {
        reason: "body-is-null";
        statusCode: number;
    };
};
/**
 * Returns true when `value` is a failure record created by `getResponseBody` (for example malformed JSON),
 * as opposed to a parsed JSON body that happens to have the same shape.
 */
export declare function isResponseBodyError(value: unknown): value is ResponseBodyError;
export declare function getResponseBody(response: Response, responseType?: string): Promise<unknown>;
