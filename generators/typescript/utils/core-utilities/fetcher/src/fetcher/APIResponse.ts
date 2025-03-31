import { RawResponse } from "../RawResponse";

export type APIResponse<Success, Failure> = SuccessfulResponse<Success> | FailedResponse<Failure>;

export interface SuccessfulResponse<T> {
    ok: true;
    body: T;
    headers?: Record<string, any>;
    rawResponse: RawResponse;
}

export interface FailedResponse<T> {
    ok: false;
    error: T;
}