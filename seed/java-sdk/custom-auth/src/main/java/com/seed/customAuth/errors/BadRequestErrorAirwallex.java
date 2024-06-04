package com.seed.customAuth.errors;

public class BadRequestErrorAirwallex extends AirwallexApiError {

    public BadRequestErrorAirwallex(Object body) {
        super("BadRequestError", 400, body);
    }
}
