package com.fern.types.services.http;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.util.Locale;
import javax.annotation.Nonnull;

public final class HttpAuth {
  public static final HttpAuth NONE = new HttpAuth(Value.NONE, "NONE");

  public static final HttpAuth BEARER = new HttpAuth(Value.BEARER, "BEARER");

  private final Value value;

  private final String string;

  HttpAuth(Value value, String string) {
    this.value = value;
    this.string = string;
  }

  public Value getEnumValue() {
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
      || (other instanceof HttpAuth && this.string.equals(((HttpAuth) other).string));
  }

  @Override
  public int hashCode() {
    return this.string.hashCode();
  }

  public <T> T visit(Visitor<T> visitor) {
    switch (value) {
      case NONE:
        return visitor.visitNONE();
      case BEARER:
        return visitor.visitBEARER();
      case UNKNOWN:
      default:
        return visitor.visitUnknown(string);
    }
  }

  @JsonCreator(
      mode = JsonCreator.Mode.DELEGATING
  )
  public static HttpAuth valueOf(@Nonnull String value) {
    String upperCasedValue = value.toUpperCase(Locale.ROOT);
    switch (upperCasedValue) {
      case "NONE":
        return NONE;
      case "BEARER":
        return BEARER;
      default:
        return new HttpAuth(Value.UNKNOWN, upperCasedValue);
    }
  }

  public enum Value {
    BEARER,

    NONE,

    UNKNOWN
  }

  public interface Visitor<T> {
    T visitBEARER();

    T visitNONE();

    T visitUnknown(String unknownType);
  }
}
