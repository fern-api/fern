package com.fern.java.auth;

import com.fasterxml.jackson.annotation.JsonValue;
import org.immutables.value.Value;

@Value.Immutable
@Value.Style(visibility = Value.Style.ImplementationVisibility.PACKAGE, jdkOnly = true)
public abstract class AuthHeader {

    @Value.Parameter
    @JsonValue
    public abstract String getToken();

    public static AuthHeader of(String authHeader) {
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
        return ImmutableAuthHeader.of(token);
    }

    @Override
    public final String toString() {
        return "Bearer " + getToken();
    }
}
