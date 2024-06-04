package com.seed.customAuth.errors;

public class BadRequestError extends ApiError {

    public BadRequestError(Object body) {
        super("BadRequestError", 400, body);
    }
}
