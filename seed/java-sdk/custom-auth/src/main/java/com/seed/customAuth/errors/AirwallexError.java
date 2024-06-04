package com.seed.customAuth.errors;

public class AirwallexError extends RuntimeException {

    public AirwallexError(String message) {
        super(message);
    }

    public AirwallexError(String message, Exception e) {
        super(message, e);
    }
}
