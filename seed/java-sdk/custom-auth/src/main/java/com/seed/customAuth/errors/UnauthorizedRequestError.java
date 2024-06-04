package com.seed.customAuth.errors;

import com.seed.customAuth.resources.errors.types.UnauthorizedRequestErrorBody;

public class UnauthorizedRequestError extends ApiError {

    private final UnauthorizedRequestErrorBody body;

    public UnauthorizedRequestError(UnauthorizedRequestErrorBody body) {
        super("UnauthorizedRequest", 401, body);
        this.body = body;
    }

    @Override
    public UnauthorizedRequestErrorBody body() {
        return body;
    }
}
