package com.fern;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import javax.annotation.Nonnull;
import java.util.Locale;

public final class WebSocketMessageResponseBehavior {

    public static final WebSocketMessageResponseBehavior ONGOING =
            new WebSocketMessageResponseBehavior(Value.ONGOING, Value.ONGOING.name());
    public static final WebSocketMessageResponseBehavior REQUEST_RESPONSE =
            new WebSocketMessageResponseBehavior(Value.REQUEST_RESPONSE, Value.REQUEST_RESPONSE.name());

    private final WebSocketMessageResponseBehavior.Value value;
    private final String string;

    private WebSocketMessageResponseBehavior(WebSocketMessageResponseBehavior.Value value, String string) {
        this.value = value;
        this.string = string;
    }

    public enum Value {
        ONGOING,
        REQUEST_RESPONSE,
        UNKNOWN
    }

    public WebSocketMessageResponseBehavior.Value getEnumValue() {
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
                || (other instanceof PrimitiveType && this.string.equals(((WebSocketMessageResponseBehavior) other).string));
    }

    @Override
    public int hashCode() {
        return this.string.hashCode();
    }

    public <T> T accept(WebSocketMessageResponseBehavior.Visitor<T> visitor) {
        switch (value) {
            case ONGOING:
                return visitor.visitOngoing();
            case REQUEST_RESPONSE:
                return visitor.visitRequestResponse();
            case UNKNOWN:
            default:
                return visitor.visitUnknown(string);
        }
    }

    public interface Visitor<T> {
        T visitOngoing();

        T visitRequestResponse();

        T visitUnknown(String unknownValue);
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static WebSocketMessageResponseBehavior valueOf(@Nonnull String value) {
        String upperCasedValue = value.toUpperCase(Locale.ROOT);
        switch (upperCasedValue) {
            case "ONGOING":
                return ONGOING;
            case "REQUEST_RESPONSE":
                return REQUEST_RESPONSE;
            default:
                return new WebSocketMessageResponseBehavior(WebSocketMessageResponseBehavior.Value.UNKNOWN, upperCasedValue);
        }
    }
}
