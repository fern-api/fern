package com.fern.types.types;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.util.Locale;
import javax.annotation.Nonnull;

public final class PrimitiveType {
  public static final PrimitiveType LONG = new PrimitiveType(Value.LONG, "LONG");

  public static final PrimitiveType STRING = new PrimitiveType(Value.STRING, "STRING");

  public static final PrimitiveType BOOLEAN = new PrimitiveType(Value.BOOLEAN, "BOOLEAN");

  public static final PrimitiveType INTEGER = new PrimitiveType(Value.INTEGER, "INTEGER");

  public static final PrimitiveType DOUBLE = new PrimitiveType(Value.DOUBLE, "DOUBLE");

  private final Value value;

  private final String string;

  PrimitiveType(Value value, String string) {
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
      || (other instanceof PrimitiveType && this.string.equals(((PrimitiveType) other).string));
  }

  @Override
  public int hashCode() {
    return this.string.hashCode();
  }

  public <T> T visit(Visitor<T> visitor) {
    switch (value) {
      case LONG:
        return visitor.visitLONG();
      case STRING:
        return visitor.visitSTRING();
      case BOOLEAN:
        return visitor.visitBOOLEAN();
      case INTEGER:
        return visitor.visitINTEGER();
      case DOUBLE:
        return visitor.visitDOUBLE();
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
      case "LONG":
        return LONG;
      case "STRING":
        return STRING;
      case "BOOLEAN":
        return BOOLEAN;
      case "INTEGER":
        return INTEGER;
      case "DOUBLE":
        return DOUBLE;
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
    T visitINTEGER();

    T visitDOUBLE();

    T visitSTRING();

    T visitBOOLEAN();

    T visitLONG();

    T visitUnknown(String unknownType);
  }
}
