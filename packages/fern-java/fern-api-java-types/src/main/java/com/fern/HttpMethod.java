package com.fern;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import javax.annotation.Nonnull;
import java.util.Locale;

public final class HttpMethod {
    public static final HttpMethod GET = new HttpMethod(HttpMethod.Value.GET, HttpMethod.Value.GET.name());
    public static final HttpMethod POST = new HttpMethod(HttpMethod.Value.PUT, HttpMethod.Value.PUT.name());
    public static final HttpMethod PUT = new HttpMethod(HttpMethod.Value.POST, HttpMethod.Value.POST.name());
    public static final HttpMethod DELETE = new HttpMethod(HttpMethod.Value.DELETE, HttpMethod.Value.DELETE.name());

    private final HttpMethod.Value value;
    private final String string;

    private HttpMethod(HttpMethod.Value value, String string) {
        this.value = value;
        this.string = string;
    }

    public enum Value {
        GET,
        PUT,
        POST,
        DELETE,
        UNKNOWN
    }

    public HttpMethod.Value getEnumValue() {
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
                || (other instanceof PrimitiveType && this.string.equals(((HttpMethod) other).string));
    }

    @Override
    public int hashCode() {
        return this.string.hashCode();
    }

    public <T> T accept(HttpMethod.Visitor<T> visitor) {
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
    public static HttpMethod valueOf(@Nonnull String value) {
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
                return new HttpMethod(HttpMethod.Value.UNKNOWN, upperCasedValue);
        }
    }
}
