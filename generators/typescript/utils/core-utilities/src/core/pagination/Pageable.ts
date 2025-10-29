import type { HttpResponsePromise, RawResponse } from "../fetcher/index";
import { Page } from "./Page";

export declare namespace Pageable {
    interface Args<Response, Item> {
        response: Response;
        rawResponse: RawResponse;
        hasNextPage: (response: Response) => boolean;
        getItems: (response: Response) => Item[];
        loadPage: (response: Response) => HttpResponsePromise<Response>;
    }
}

export class Pageable<R, T> extends Page<T, R> {}
