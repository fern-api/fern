export type _Response<S = void, F = void> = _SuccessResponse<S> | _FailedResponse<F>;

export type _SuccessResponse<T> = T extends void
    ? { ok: true }
    : {
          ok: true;
          body: T;
      };

export type _FailedResponse<T> = T extends void
    ? { ok: false }
    : {
          ok: false;
          error: T;
      };
