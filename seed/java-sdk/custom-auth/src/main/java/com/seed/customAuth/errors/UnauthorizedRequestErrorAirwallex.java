package com.seed.customAuth.errors;

import com.seed.customAuth.resources.errors.types.UnauthorizedRequestErrorBody;

public class UnauthorizedRequestErrorAirwallex extends AirwallexApiError {

    private final UnauthorizedRequestErrorBody body;

    public UnauthorizedRequestErrorAirwallex(UnauthorizedRequestErrorBody body) {
        super("UnauthorizedRequest", 401, body);
        this.body = body;
    }

    @Override
    public UnauthorizedRequestErrorBody body() {
        return body;
    }
}
