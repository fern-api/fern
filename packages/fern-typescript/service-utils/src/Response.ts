export type _Response<S, F> = _SuccessResponse<S> | _FailedResponse<F>;

export interface _SuccessResponse<T> {
    ok: true;
    body: T;
}

export interface _FailedResponse<T> {
    ok: false;
    error: T;
}
