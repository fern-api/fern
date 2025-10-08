import { HttpResponsePromise, type RawResponse } from "../fetcher/index.js";

/**
 * A page of results from a paginated API.
 *
 * @template T The type of the items in the page.
 */
export class Page<T> implements AsyncIterable<T> {
    public data: T[];
    public rawResponse: RawResponse;

    private response: unknown;
    private _hasNextPage: (response: unknown) => boolean;
    private getItems: (response: unknown) => T[];
    private loadNextPage: (response: unknown) => HttpResponsePromise<unknown>;

    constructor({
        response,
        rawResponse,
        hasNextPage,
        getItems,
        loadPage,
    }: {
        response: unknown;
        rawResponse: RawResponse;
        hasNextPage: (response: unknown) => boolean;
        getItems: (response: unknown) => T[];
        loadPage: (response: unknown) => HttpResponsePromise<any>;
    }) {
        this.response = response;
        this.rawResponse = rawResponse;
        this.data = getItems(response);
        this._hasNextPage = hasNextPage;
        this.getItems = getItems;
        this.loadNextPage = loadPage;
    }

    /**
     * Retrieves the next page
     * @returns this
     */
    public async getNextPage(): Promise<this> {
        const { data, rawResponse } = await this.loadNextPage(this.response).withRawResponse();
        this.response = data;
        this.rawResponse = rawResponse;
        this.data = this.getItems(this.response);
        return this;
    }

    /**
     * @returns whether there is a next page to load
     */
    public hasNextPage(): boolean {
        return this._hasNextPage(this.response);
    }

    private async *iterMessages(): AsyncGenerator<T, void> {
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

    async *[Symbol.asyncIterator](): AsyncIterator<T, void, any> {
        for await (const message of this.iterMessages()) {
            yield message;
        }
    }
}
