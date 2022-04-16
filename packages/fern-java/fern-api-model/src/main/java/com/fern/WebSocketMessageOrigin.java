package com.fern;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.util.Locale;
import javax.annotation.Nonnull;

public final class WebSocketMessageOrigin {
  public static final WebSocketMessageOrigin SERVER = new WebSocketMessageOrigin(Value.SERVER, "SERVER");

  public static final WebSocketMessageOrigin CLIENT = new WebSocketMessageOrigin(Value.CLIENT, "CLIENT");

  private final Value value;

  private final String string;

  WebSocketMessageOrigin(Value value, String string) {
    this.value = value;
    this.string = string;
  }

  Value getEnumValue() {
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
      || (other instanceof WebSocketMessageOrigin && this.string.equals(((WebSocketMessageOrigin) other).string));
  }

  @Override
  public int hashCode() {
    return this.string.hashCode();
  }

  public <T> T accept(Visitor<T> visitor) {
    switch (value) {
      case SERVER:
        return visitor.visitServer();
      case CLIENT:
        return visitor.visitClient();
      case UNKNOWN:
      default:
        return visitor.visitUnknown(string);
    }
  }

  @JsonCreator(
      mode = JsonCreator.Mode.DELEGATING
  )
  public static WebSocketMessageOrigin valueOf(@Nonnull String value) {
    String upperCasedValue = value.toUpperCase(Locale.ROOT);
    switch (upperCasedValue) {
      case "SERVER":
        return SERVER;
      case "CLIENT":
        return CLIENT;
      default:
        return new WebSocketMessageOrigin(Value.UNKNOWN, upperCasedValue);
    }
  }

  public enum Value {
    CLIENT,

    SERVER,

    UNKNOWN
  }

  public interface Visitor<T> {
    T visitClient();

    T visitServer();

    T visitUnknown(String unknownType);
  }
}
