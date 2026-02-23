import type { HttpResponsePromise, RawResponse } from "../fetcher/index.js";
/**
 * A page of results from a paginated API.
 *
 * @template T The type of the items in the page.
 * @template R The type of the API response.
 */
export declare class Page<T, R = unknown> implements AsyncIterable<T> {
    data: T[];
    rawResponse: RawResponse;
    response: R;
    private _hasNextPage;
    private getItems;
    private loadNextPage;
    constructor({ response, rawResponse, hasNextPage, getItems, loadPage, }: {
        response: R;
        rawResponse: RawResponse;
        hasNextPage: (response: R) => boolean;
        getItems: (response: R) => T[];
        loadPage: (response: R) => HttpResponsePromise<R>;
    });
    /**
     * Retrieves the next page
     * @returns this
     */
    getNextPage(): Promise<this>;
    /**
     * @returns whether there is a next page to load
     */
    hasNextPage(): boolean;
    private iterMessages;
    [Symbol.asyncIterator](): AsyncIterator<T, void, any>;
}
