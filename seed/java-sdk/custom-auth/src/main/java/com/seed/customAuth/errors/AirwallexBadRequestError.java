package com.seed.customAuth.errors;

public class AirwallexBadRequestError extends AirwallexApiError {

    public AirwallexBadRequestError(Object body) {
        super("BadRequestError", 400, body);
    }
}
