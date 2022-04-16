package com.fern;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.util.Locale;
import javax.annotation.Nonnull;

public final class WebSocketMessageResponseBehavior {
  public static final WebSocketMessageResponseBehavior REQUEST_RESPONSE = new WebSocketMessageResponseBehavior(Value.REQUEST_RESPONSE, "REQUEST_RESPONSE");

  public static final WebSocketMessageResponseBehavior ONGOING = new WebSocketMessageResponseBehavior(Value.ONGOING, "ONGOING");

  private final Value value;

  private final String string;

  WebSocketMessageResponseBehavior(Value value, String string) {
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
      || (other instanceof WebSocketMessageResponseBehavior && this.string.equals(((WebSocketMessageResponseBehavior) other).string));
  }

  @Override
  public int hashCode() {
    return this.string.hashCode();
  }

  public <T> T accept(Visitor<T> visitor) {
    switch (value) {
      case ONGOING:
        return visitor.visitOngoing();
      case REQUEST_RESPONSE:
        return visitor.visitRequest_response();
      case UNKNOWN:
      default:
        return visitor.visitUnknown(string);
    }
  }

  @JsonCreator(
      mode = JsonCreator.Mode.DELEGATING
  )
  public static WebSocketMessageResponseBehavior valueOf(@Nonnull String value) {
    String upperCasedValue = value.toUpperCase(Locale.ROOT);
    switch (upperCasedValue) {
      case "REQUEST_RESPONSE":
        return REQUEST_RESPONSE;
      case "ONGOING":
        return ONGOING;
      default:
        return new WebSocketMessageResponseBehavior(Value.UNKNOWN, upperCasedValue);
    }
  }

  public enum Value {
    ONGOING,

    REQUEST_RESPONSE,

    UNKNOWN
  }

  public interface Visitor<T> {
    T visitOngoing();

    T visitRequest_response();

    T visitUnknown(String unknownType);
  }
}
