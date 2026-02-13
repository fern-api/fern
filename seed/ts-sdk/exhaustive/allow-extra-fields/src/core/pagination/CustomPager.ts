import type { BaseRequestOptions, NormalizedClientOptions } from "../../BaseClient.js";
import type { APIResponse } from "../fetcher/APIResponse.js";
import type { Fetcher } from "../fetcher/Fetcher.js";
import type { RawResponse } from "../fetcher/index.js";

/**
 *
 * @template TItem The type of the items in the page.
 * @template TResponse The type of the API response.
 */
export class CustomPager<TItem, TResponse> implements AsyncIterable<TItem> {
    /** The items from the current page */
    public data: TItem[];
    /** The raw HTTP response */
    public rawResponse: RawResponse;
    /** The parsed response object */
    public response: TResponse;

    private sendRequest: (request: Fetcher.Args) => Promise<APIResponse<TResponse, Fetcher.Error>>;
    private nextRequest?: Fetcher.Args;
    private previousRequest?: Fetcher.Args;
    private _hasNextPage: boolean;
    private _hasPreviousPage: boolean;

    constructor(args: {
        response: TResponse;
        rawResponse: RawResponse;
        items: TItem[];
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        nextRequest?: Fetcher.Args;
        previousRequest?: Fetcher.Args;
        sendRequest: (request: Fetcher.Args) => Promise<APIResponse<TResponse, Fetcher.Error>>;
    }) {
        this.response = args.response;
        this.rawResponse = args.rawResponse;
        this.data = args.items;
        this._hasNextPage = args.hasNextPage;
        this._hasPreviousPage = args.hasPreviousPage;
        this.nextRequest = args.nextRequest;
        this.previousRequest = args.previousRequest;
        this.sendRequest = args.sendRequest;
    }

    /**
     * @returns whether there is a next page to load
     */
    public hasNextPage(): boolean {
        return this._hasNextPage;
    }

    /**
     * @returns whether there is a previous page to load
     */
    public hasPreviousPage(): boolean {
        return this._hasPreviousPage;
    }

    /**
     * Returns the current page data.
     * This is an alias for the `data` property for consistency with other pagination APIs.
     *
     * @returns the items from the current page
     */
    public getCurrentPage(): TItem[] {
        return this.data;
    }

    /**
     * Retrieves the next page of results.
     * @returns this pager with updated data
     * @throws Error if there is no next page
     */
    public async getNextPage(): Promise<this> {
        if (!this._hasNextPage || !this.nextRequest) {
            throw new Error("No next page available");
        }
        const response = await this.sendRequest(this.nextRequest);
        if (!response.ok) {
            const reason =
                response.error.reason === "status-code" ? `HTTP ${response.error.statusCode}` : response.error.reason;
            throw new Error(`Failed to fetch next page: ${reason}`);
        }
        const data = response.body;
        const rawResponse = response.rawResponse;
        const parsed = await parse<TItem, TResponse>({ request: this.nextRequest, data, rawResponse });
        this.response = data;
        this.rawResponse = rawResponse;
        this.data = parsed.items;
        this._hasNextPage = parsed.hasNextPage;
        this._hasPreviousPage = parsed.hasPreviousPage;
        this.nextRequest = parsed.nextRequest;
        this.previousRequest = parsed.previousRequest;
        return this;
    }

    /**
     * Retrieves the previous page of results.
     * @returns this pager with updated data
     * @throws Error if there is no previous page
     */
    public async getPreviousPage(): Promise<this> {
        if (!this._hasPreviousPage || !this.previousRequest) {
            throw new Error("No previous page available");
        }
        const response = await this.sendRequest(this.previousRequest);
        if (!response.ok) {
            const reason =
                response.error.reason === "status-code" ? `HTTP ${response.error.statusCode}` : response.error.reason;
            throw new Error(`Failed to fetch previous page: ${reason}`);
        }
        const data = response.body;
        const rawResponse = response.rawResponse;
        const parsed = await parse<TItem, TResponse>({ request: this.previousRequest, data, rawResponse });
        this.response = data;
        this.rawResponse = rawResponse;
        this.data = parsed.items;
        this._hasNextPage = parsed.hasNextPage;
        this._hasPreviousPage = parsed.hasPreviousPage;
        this.nextRequest = parsed.nextRequest;
        this.previousRequest = parsed.previousRequest;
        return this;
    }

    private async *iterMessages(): AsyncGenerator<TItem, void> {
        for (const item of this.data) {
            yield item;
        }

        while (this.hasNextPage()) {
            await this.getNextPage();
            for (const item of this.data) {
                yield item;
            }
        }
    }

    async *[Symbol.asyncIterator](): AsyncIterator<TItem, void, unknown> {
        for await (const message of this.iterMessages()) {
            yield message;
        }
    }
}

export async function createCustomPager<TItem, TResponse>({
    sendRequest,
    initialHttpRequest,
    clientOptions,
}: {
    sendRequest: (request: Fetcher.Args) => Promise<APIResponse<TResponse, Fetcher.Error>>;
    initialHttpRequest: Fetcher.Args;
    clientOptions: NormalizedClientOptions;
    requestOptions?: BaseRequestOptions;
}): Promise<CustomPager<TItem, TResponse>> {
    const response = await sendRequest(initialHttpRequest);
    if (!response.ok) {
        const reason =
            response.error.reason === "status-code" ? `HTTP ${response.error.statusCode}` : response.error.reason;
        throw new Error(`Failed to fetch initial page: ${reason}`);
    }
    const data = response.body;
    const rawResponse = response.rawResponse;
    const parsed = await parse<TItem, TResponse>({ request: initialHttpRequest, data, rawResponse });
    return new CustomPager({
        response: data,
        rawResponse,
        items: parsed.items,
        hasNextPage: parsed.hasNextPage,
        hasPreviousPage: parsed.hasPreviousPage,
        nextRequest: parsed.nextRequest,
        previousRequest: parsed.previousRequest,
        sendRequest: sendRequest,
    });
}

async function parse<TItem, TResponse>(_args: {
    request: Fetcher.Args;
    data: TResponse;
    rawResponse: RawResponse;
}): Promise<{
    nextRequest?: Fetcher.Args;
    hasNextPage: boolean;
    previousRequest?: Fetcher.Args;
    hasPreviousPage: boolean;
    items: TItem[];
}> {
    // Placeholder implementation.
    // TODO: Replace this with actual parsing logic.
    return {
        items: [],
        hasNextPage: false,
        hasPreviousPage: false,
    };
}
