import type { RawResponse } from "../fetcher/index.js";
import { Page } from "./Page.js";

export declare namespace Pageable {
    interface Args<Response, Item> {
        response: Response;
        rawResponse: RawResponse;
        hasNextPage: (response: Response) => boolean;
        getItems: (response: Response) => Item[];
        loadPage: (response: Response) => Promise<Response>;
    }
}

export class Pageable<R, T> extends Page<T> {
    constructor(args: Pageable.Args<R, T>) {
        super(args as any);
    }
}
