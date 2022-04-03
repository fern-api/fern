package com.fern;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import javax.annotation.Nonnull;
import java.util.Locale;

public final class HttpVerb {
    public static final HttpVerb GET = new HttpVerb(HttpVerb.Value.GET, HttpVerb.Value.GET.name());
    public static final HttpVerb POST = new HttpVerb(HttpVerb.Value.PUT, HttpVerb.Value.PUT.name());
    public static final HttpVerb PUT = new HttpVerb(HttpVerb.Value.POST, HttpVerb.Value.POST.name());
    public static final HttpVerb DELETE = new HttpVerb(HttpVerb.Value.DELETE, HttpVerb.Value.DELETE.name());

    private final HttpVerb.Value value;
    private final String string;

    private HttpVerb(HttpVerb.Value value, String string) {
        this.value = value;
        this.string = string;
    }

    enum Value {
        GET,
        PUT,
        POST,
        DELETE,
        UNKNOWN
    }

    public HttpVerb.Value getEnumValue() {
        return value;
    }

    @Override
    @JsonValue
    public String toString() {
        return this.string;
    }

    @Override
    public boolean equals(Object other) {
        return (this == other)
                || (other instanceof PrimitiveType && this.string.equals(((HttpVerb) other).string));
    }

    @Override
    public int hashCode() {
        return this.string.hashCode();
    }

    public <T> T accept(HttpVerb.Visitor<T> visitor) {
        switch (value) {
            case GET:
                return visitor.visitGet();
            case PUT:
                return visitor.visitPut();
            case POST:
                return visitor.visitPost();
            case DELETE:
                return visitor.visitDelete();
            case UNKNOWN:
            default:
                return visitor.visitUnknown(string);
        }
    }

    public interface Visitor<T> {
        T visitGet();

        T visitPut();

        T visitPost();

        T visitDelete();

        T visitUnknown(String unknownValue);
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static HttpVerb valueOf(@Nonnull String value) {
        String upperCasedValue = value.toUpperCase(Locale.ROOT);
        switch (upperCasedValue) {
            case "GET":
                return GET;
            case "PUT":
                return PUT;
            case "POST":
                return POST;
            case "DELETE":
                return DELETE;
            default:
                return new HttpVerb(HttpVerb.Value.UNKNOWN, upperCasedValue);
        }
    }
}
