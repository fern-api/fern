import type { HttpResponsePromise, RawResponse } from "../fetcher/index.js";
import { Page } from "./Page.js";

/**
 * Response structure from Payroc APIs with pagination links
 */
interface PayrocPaginatedResponse<TItem> {
    /** The data items in the current page */
    data?: TItem[];
    /** Pagination links for navigating between pages */
    links?: Array<{
        /** The relationship type (e.g., "next", "previous") */
        rel?: string;
        /** The URL for the link */
        href?: string;
    }>;
}

/**
 * Context object for Payroc pagination.
 *
 * @template TRequest The type of the request object.
 * @template TResponse The type of the API response.
 */
interface PayrocPagerContext<TRequest, TResponse> {
    /** Function to send a request and get a response */
    sendRequest: (request: TRequest) => HttpResponsePromise<TResponse>;
    /** The initial request that started the pagination */
    initialRequest: TRequest;
    /** Optional function to get the authorization header value */
    getAuthHeader?: () => string;
}

/**
 * BiPager interface for pagination that supports both forward and backward navigation.
 *
 * @template TItem The type of items in the page.
 * @template TResponse The type of the API response.
 */
interface BiPager<TItem, TResponse = unknown> {
    /** Whether there is a next page available */
    hasNextPage(): boolean;
    /** Whether there is a previous page available */
    hasPreviousPage(): boolean;
    /** The current page of items */
    currentPage: Page<TItem, TResponse>;
}

/**
 * A pager for Payroc's paginated API responses.
 * Handles the standard Payroc pagination format with links in the response.
 *
 * @template TItem The type of items in the page.
 * @template TRequest The type of the request object.
 * @template TResponse The type of the API response.
 */
export class MyPager<TItem, TRequest, TResponse extends PayrocPaginatedResponse<TItem>>
    implements BiPager<TItem, TResponse>, AsyncIterable<TItem>
{
    private static readonly NEXT_REL = "next";
    private static readonly PREVIOUS_REL = "previous";

    private readonly context: PayrocPagerContext<TRequest, TResponse>;
    private readonly getAuthHeader?: () => string;

    private nextPageRequest?: TRequest;
    private previousPageRequest?: TRequest;
    private _hasNextPage: boolean;
    private _hasPreviousPage: boolean;

    /** The current page of items */
    public currentPage: Page<TItem, TResponse>;

    private constructor(
        context: PayrocPagerContext<TRequest, TResponse>,
        nextPageRequest: TRequest | undefined,
        hasNextPage: boolean,
        previousPageRequest: TRequest | undefined,
        hasPreviousPage: boolean,
        page: Page<TItem, TResponse>,
    ) {
        this.context = context;
        this.nextPageRequest = nextPageRequest;
        this._hasNextPage = hasNextPage;
        this.previousPageRequest = previousPageRequest;
        this._hasPreviousPage = hasPreviousPage;
        this.currentPage = page;
        this.getAuthHeader = context.getAuthHeader;
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
     * @returns A new Page with the next page data
     */
    public async getNextPageAsync(): Promise<Page<TItem, TResponse>> {
        if (!this.nextPageRequest) {
            return this.createEmptyPage();
        }

        return await this.sendRequestAndHandleResponse(this.nextPageRequest);
    }

    /**
     * Retrieves the previous page of results.
     * @returns A new Page with the previous page data
     */
    public async getPreviousPageAsync(): Promise<Page<TItem, TResponse>> {
        if (!this.previousPageRequest) {
            return this.createEmptyPage();
        }

        return await this.sendRequestAndHandleResponse(this.previousPageRequest);
    }

    private createEmptyPage(): Page<TItem, TResponse> {
        return new Page<TItem, TResponse>({
            response: this.currentPage.response,
            rawResponse: this.currentPage.rawResponse,
            hasNextPage: () => false,
            getItems: () => [],
            loadPage: () => this.context.sendRequest(this.context.initialRequest),
        });
    }

    private async sendRequestAndHandleResponse(request: TRequest): Promise<Page<TItem, TResponse>> {
        const { data: response, rawResponse } = await this.context.sendRequest(request).withRawResponse();
        const parsed = await MyPager.parseHttpCallAsync<TItem, TRequest, TResponse>(request, response, rawResponse);

        this.nextPageRequest = parsed.nextPageRequest;
        this._hasNextPage = parsed.hasNextPage;
        this.previousPageRequest = parsed.previousPageRequest;
        this._hasPreviousPage = parsed.hasPreviousPage;
        this.currentPage = parsed.page;

        return parsed.page;
    }

    /**
     * Parses the HTTP response and extracts pagination information.
     */
    private static async parseHttpCallAsync<TItem, TRequest, TResponse extends PayrocPaginatedResponse<TItem>>(
        request: TRequest,
        response: TResponse,
        rawResponse: RawResponse,
    ): Promise<{
        nextPageRequest?: TRequest;
        hasNextPage: boolean;
        previousPageRequest?: TRequest;
        hasPreviousPage: boolean;
        page: Page<TItem, TResponse>;
    }> {
        const prevUri = MyPager.getLinkUri(response, MyPager.PREVIOUS_REL);
        const hasPreviousPage = prevUri !== undefined;
        const previousPageRequest = prevUri ? MyPager.cloneRequestWithNewUri(request, prevUri) : undefined;

        const nextUri = MyPager.getLinkUri(response, MyPager.NEXT_REL);
        const hasNextPage = nextUri !== undefined;
        const nextPageRequest = nextUri ? MyPager.cloneRequestWithNewUri(request, nextUri) : undefined;

        const page = new Page<TItem, TResponse>({
            response,
            rawResponse,
            hasNextPage: () => false,
            getItems: (r: TResponse) => r.data ?? [],
            loadPage: () => {
                throw new Error("loadPage should not be called on MyPager pages");
            },
        });

        return {
            nextPageRequest,
            hasNextPage,
            previousPageRequest,
            hasPreviousPage,
            page,
        };
    }

    /**
     * Extracts a link URI from the response based on the rel type.
     */
    private static getLinkUri<TItem>(response: PayrocPaginatedResponse<TItem>, rel: string): string | undefined {
        if (!response.links) {
            return undefined;
        }

        for (const link of response.links) {
            if (link.rel === rel && link.href) {
                return link.href;
            }
        }

        return undefined;
    }

    /**
     * Clones a request with a new URI.
     */
    private static cloneRequestWithNewUri<TRequest>(request: TRequest, newUri: string): TRequest {
        const cloned = { ...request } as any;
        cloned.url = newUri;
        return cloned as TRequest;
    }

    /**
     * Async iterator implementation for iterating through all items across pages.
     */
    async *[Symbol.asyncIterator](): AsyncIterator<TItem, void, unknown> {
        for (const item of this.currentPage.data) {
            yield item;
        }

        for await (const page of this.getNextPagesAsync()) {
            for (const item of page.data) {
                yield item;
            }
        }
    }

    /**
     * Async generator for iterating through all next pages.
     */
    public async *getNextPagesAsync(): AsyncGenerator<Page<TItem, TResponse>, void> {
        while (this.hasNextPage()) {
            yield await this.getNextPageAsync();
        }
    }

    /**
     * Async generator for iterating through all previous pages.
     */
    public async *getPreviousPagesAsync(): AsyncGenerator<Page<TItem, TResponse>, void> {
        while (this.hasPreviousPage()) {
            yield await this.getPreviousPageAsync();
        }
    }

    /**
     * Creates a MyPager by making the initial request and parsing the response.
     *
     * @param args Object with sendRequest and initialRequest
     * @returns A new MyPager instance
     */
    public static async create<TItem, TRequest, TResponse extends PayrocPaginatedResponse<TItem>>(args: {
        sendRequest: (request: TRequest) => HttpResponsePromise<TResponse>;
        initialRequest: TRequest;
        getAuthHeader?: () => string;
    }): Promise<MyPager<TItem, TRequest, TResponse>> {
        const context: PayrocPagerContext<TRequest, TResponse> = {
            sendRequest: args.sendRequest,
            initialRequest: args.initialRequest,
            getAuthHeader: args.getAuthHeader,
        };

        const { data: response, rawResponse } = await context.sendRequest(context.initialRequest).withRawResponse();
        const parsed = await MyPager.parseHttpCallAsync<TItem, TRequest, TResponse>(
            context.initialRequest,
            response,
            rawResponse,
        );

        return new MyPager(
            context,
            parsed.nextPageRequest,
            parsed.hasNextPage,
            parsed.previousPageRequest,
            parsed.hasPreviousPage,
            parsed.page,
        );
    }
}
