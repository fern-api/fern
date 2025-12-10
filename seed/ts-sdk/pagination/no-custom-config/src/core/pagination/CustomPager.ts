import type { HttpResponsePromise, RawResponse, WithRawResponse } from "../fetcher/index.js";

/**
 * Parser function type for custom pagination.
 * SDK authors implement this to define how to extract items and determine pagination state.
 *
 * @template TItem The type of items in the paginated response.
 * @template TRequest The type of the request object.
 * @template TResponse The type of the API response.
 */
export type CustomPagerParser<TItem, TRequest, TResponse> = (
    request: TRequest,
    response: WithRawResponse<TResponse>,
) => Promise<{
    /** The request to use for fetching the next page, if any */
    nextRequest?: TRequest;
    /** Whether there is a next page available */
    hasNextPage: boolean;
    /** The request to use for fetching the previous page, if any */
    previousRequest?: TRequest;
    /** Whether there is a previous page available */
    hasPreviousPage: boolean;
    /** The items extracted from the current response */
    items: TItem[];
}>;

/**
 * A custom pager for paginated API responses where the pagination logic
 * must be implemented by the SDK author.
 *
 * SDK authors provide a parser callback to extract items and determine
 * pagination state from responses.
 *
 * @template TItem The type of the items in the page.
 * @template TRequest The type of the request object.
 * @template TResponse The type of the API response.
 */
export class CustomPager<TItem, TRequest, TResponse> implements AsyncIterable<TItem> {
    /** The items from the current page */
    public data: TItem[];
    /** The raw HTTP response */
    public rawResponse: RawResponse;
    /** The parsed response object */
    public response: TResponse;

    private context: {
        sendRequest: (request: TRequest) => HttpResponsePromise<TResponse>;
        currentRequest: TRequest;
    };
    private parser: CustomPagerParser<TItem, TRequest, TResponse>;
    private nextRequest?: TRequest;
    private previousRequest?: TRequest;
    private _hasNextPage: boolean;
    private _hasPreviousPage: boolean;

    private constructor(args: {
        response: TResponse;
        rawResponse: RawResponse;
        items: TItem[];
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        nextRequest?: TRequest;
        previousRequest?: TRequest;
        context: {
            sendRequest: (request: TRequest) => HttpResponsePromise<TResponse>;
            currentRequest: TRequest;
        };
        parser: CustomPagerParser<TItem, TRequest, TResponse>;
    }) {
        this.response = args.response;
        this.rawResponse = args.rawResponse;
        this.data = args.items;
        this._hasNextPage = args.hasNextPage;
        this._hasPreviousPage = args.hasPreviousPage;
        this.nextRequest = args.nextRequest;
        this.previousRequest = args.previousRequest;
        this.context = args.context;
        this.parser = args.parser;
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
     * Retrieves the next page of results.
     * @returns this pager with updated data
     * @throws Error if there is no next page
     */
    public async getNextPage(): Promise<this> {
        if (!this._hasNextPage || !this.nextRequest) {
            throw new Error("No next page available");
        }
        const { data, rawResponse } = await this.context.sendRequest(this.nextRequest).withRawResponse();
        const parsed = await this.parser(this.nextRequest, { data, rawResponse });
        this.response = data;
        this.rawResponse = rawResponse;
        this.data = parsed.items;
        this._hasNextPage = parsed.hasNextPage;
        this._hasPreviousPage = parsed.hasPreviousPage;
        this.context.currentRequest = this.nextRequest;
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
        const { data, rawResponse } = await this.context.sendRequest(this.previousRequest).withRawResponse();
        const parsed = await this.parser(this.previousRequest, { data, rawResponse });
        this.response = data;
        this.rawResponse = rawResponse;
        this.data = parsed.items;
        this._hasNextPage = parsed.hasNextPage;
        this._hasPreviousPage = parsed.hasPreviousPage;
        this.context.currentRequest = this.previousRequest;
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

    /**
     * Creates a CustomPager by making the initial request and parsing the response.
     *
     * @param args.sendRequest Function to send a request and get a response
     * @param args.initialRequest The initial request to start pagination
     * @param args.parse The parser function to extract items and pagination state
     * @returns A new CustomPager instance
     */
    public static async create<TItem, TRequest, TResponse>(args: {
        sendRequest: (request: TRequest) => HttpResponsePromise<TResponse>;
        initialRequest: TRequest;
        parse: CustomPagerParser<TItem, TRequest, TResponse>;
    }): Promise<CustomPager<TItem, TRequest, TResponse>> {
        const { data, rawResponse } = await args.sendRequest(args.initialRequest).withRawResponse();
        const parsed = await args.parse(args.initialRequest, { data, rawResponse });
        return new CustomPager({
            response: data,
            rawResponse,
            items: parsed.items,
            hasNextPage: parsed.hasNextPage,
            hasPreviousPage: parsed.hasPreviousPage,
            nextRequest: parsed.nextRequest,
            previousRequest: parsed.previousRequest,
            context: {
                sendRequest: args.sendRequest,
                currentRequest: args.initialRequest,
            },
            parser: args.parse,
        });
    }
}
