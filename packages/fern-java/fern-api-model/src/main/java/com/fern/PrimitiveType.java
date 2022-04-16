package com.fern;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.util.Locale;
import javax.annotation.Nonnull;

public final class PrimitiveType {
  public static final PrimitiveType DOUBLE = new PrimitiveType(Value.DOUBLE, "DOUBLE");

  public static final PrimitiveType STRING = new PrimitiveType(Value.STRING, "STRING");

  public static final PrimitiveType INTEGER = new PrimitiveType(Value.INTEGER, "INTEGER");

  public static final PrimitiveType LONG = new PrimitiveType(Value.LONG, "LONG");

  public static final PrimitiveType BOOLEAN = new PrimitiveType(Value.BOOLEAN, "BOOLEAN");

  private final Value value;

  private final String string;

  PrimitiveType(Value value, String string) {
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
      || (other instanceof PrimitiveType && this.string.equals(((PrimitiveType) other).string));
  }

  @Override
  public int hashCode() {
    return this.string.hashCode();
  }

  <T> T accept(Visitor<T> visitor) {
    switch (value) {
      case STRING:
        return visitor.visitString();
      case DOUBLE:
        return visitor.visitDouble();
      case BOOLEAN:
        return visitor.visitBoolean();
      case INTEGER:
        return visitor.visitInteger();
      case LONG:
        return visitor.visitLong();
      case UNKNOWN:
      default:
        return visitor.visitUnknown(string);
    }
  }

  @JsonCreator(
      mode = JsonCreator.Mode.DELEGATING
  )
  public static PrimitiveType valueOf(@Nonnull String value) {
    String upperCasedValue = value.toUpperCase(Locale.ROOT);
    switch (upperCasedValue) {
      case "DOUBLE":
        return DOUBLE;
      case "STRING":
        return STRING;
      case "INTEGER":
        return INTEGER;
      case "LONG":
        return LONG;
      case "BOOLEAN":
        return BOOLEAN;
      default:
        return new PrimitiveType(Value.UNKNOWN, upperCasedValue);
    }
  }

  public enum Value {
    INTEGER,

    DOUBLE,

    STRING,

    BOOLEAN,

    LONG,

    UNKNOWN
  }

  public interface Visitor<T> {
    T visitInteger();

    T visitDouble();

    T visitString();

    T visitBoolean();

    T visitLong();

    T visitUnknown(String unknownType);
  }
}
