/**
 * A page of results from a paginated API.
 *
 * @template T The type of the items in the page.
 */
export class Page<T> implements AsyncIterable<T> {
    public data: T[];

    private response: unknown;
    private _hasNextPage: (response: unknown) => boolean;
    private getItems: (response: unknown) => T[];
    private loadNextPage: (response: unknown) => Promise<unknown>;

    constructor({
        response,
        hasNextPage,
        getItems,
        loadPage
    }: {
        response: unknown;
        hasNextPage: (response: unknown) => boolean;
        getItems: (response: unknown) => T[];
        loadPage: (response: unknown) => Promise<any>;
    }) {
        this.response = response;
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
        this.response = await this.loadNextPage(this.response);
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
