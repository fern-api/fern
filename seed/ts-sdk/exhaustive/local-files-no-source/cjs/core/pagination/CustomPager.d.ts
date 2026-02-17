import type { BaseRequestOptions, NormalizedClientOptions } from "../../BaseClient.js";
import type { APIResponse } from "../fetcher/APIResponse.js";
import type { Fetcher } from "../fetcher/Fetcher.js";
import type { RawResponse } from "../fetcher/index.js";
/**
 *
 * @template TItem The type of the items in the page.
 * @template TResponse The type of the API response.
 */
export declare class CustomPager<TItem, TResponse> implements AsyncIterable<TItem> {
    /** The items from the current page */
    data: TItem[];
    /** The raw HTTP response */
    rawResponse: RawResponse;
    /** The parsed response object */
    response: TResponse;
    private sendRequest;
    private nextRequest?;
    private previousRequest?;
    private _hasNextPage;
    private _hasPreviousPage;
    constructor(args: {
        response: TResponse;
        rawResponse: RawResponse;
        items: TItem[];
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        nextRequest?: Fetcher.Args;
        previousRequest?: Fetcher.Args;
        sendRequest: (request: Fetcher.Args) => Promise<APIResponse<TResponse, Fetcher.Error>>;
    });
    /**
     * @returns whether there is a next page to load
     */
    hasNextPage(): boolean;
    /**
     * @returns whether there is a previous page to load
     */
    hasPreviousPage(): boolean;
    /**
     * Returns the current page data.
     * This is an alias for the `data` property for consistency with other pagination APIs.
     *
     * @returns the items from the current page
     */
    getCurrentPage(): TItem[];
    /**
     * Retrieves the next page of results.
     * @returns this pager with updated data
     * @throws Error if there is no next page
     */
    getNextPage(): Promise<this>;
    /**
     * Retrieves the previous page of results.
     * @returns this pager with updated data
     * @throws Error if there is no previous page
     */
    getPreviousPage(): Promise<this>;
    private iterMessages;
    [Symbol.asyncIterator](): AsyncIterator<TItem, void, unknown>;
}
export declare function createCustomPager<TItem, TResponse>({ sendRequest, initialHttpRequest, clientOptions, }: {
    sendRequest: (request: Fetcher.Args) => Promise<APIResponse<TResponse, Fetcher.Error>>;
    initialHttpRequest: Fetcher.Args;
    clientOptions: NormalizedClientOptions;
    requestOptions?: BaseRequestOptions;
}): Promise<CustomPager<TItem, TResponse>>;
