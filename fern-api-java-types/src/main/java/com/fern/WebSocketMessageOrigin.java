package com.fern;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import javax.annotation.Nonnull;
import java.util.Locale;

public final class WebSocketMessageOrigin {

    public static final WebSocketMessageOrigin CLIENT =
            new WebSocketMessageOrigin(Value.CLIENT, Value.CLIENT.name());
    public static final WebSocketMessageOrigin SERVER =
            new WebSocketMessageOrigin(Value.SERVER, Value.SERVER.name());

    private final WebSocketMessageOrigin.Value value;
    private final String string;

    private WebSocketMessageOrigin(WebSocketMessageOrigin.Value value, String string) {
        this.value = value;
        this.string = string;
    }

    enum Value {
        CLIENT,
        SERVER,
        UNKNOWN
    }

    public WebSocketMessageOrigin.Value getEnumValue() {
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
                || (other instanceof PrimitiveType && this.string.equals(((WebSocketMessageOrigin) other).string));
    }

    @Override
    public int hashCode() {
        return this.string.hashCode();
    }

    public <T> T accept(HttpVerb.Visitor<T> visitor) {
        switch (value) {
            case CLIENT:
                return visitor.visitGet();
            case SERVER:
                return visitor.visitPut();
            case UNKNOWN:
            default:
                return visitor.visitUnknown(string);
        }
    }

    public interface Visitor<T> {
        T visitClient();

        T visitServer();

        T visitUnknown(String unknownValue);
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static WebSocketMessageOrigin valueOf(@Nonnull String value) {
        String upperCasedValue = value.toUpperCase(Locale.ROOT);
        switch (upperCasedValue) {
            case "CLIENT":
                return CLIENT;
            case "SERVER":
                return SERVER;
            default:
                return new WebSocketMessageOrigin(WebSocketMessageOrigin.Value.UNKNOWN, upperCasedValue);
        }
    }
}
