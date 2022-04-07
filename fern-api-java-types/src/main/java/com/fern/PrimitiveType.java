package com.fern;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import javax.annotation.Nonnull;
import java.util.Locale;

/**
 * PrimitiveType is represented as a class to support parsing unknown values.
 * Rather than defaulting to throwing an exception, the application owner can decide how to handle unknown.
 */
public final class PrimitiveType {

    public static final PrimitiveType INTEGER = new PrimitiveType(Value.INTEGER, Value.INTEGER.name());
    public static final PrimitiveType DOUBLE = new PrimitiveType(Value.DOUBLE, Value.DOUBLE.name());
    public static final PrimitiveType LONG = new PrimitiveType(Value.LONG, Value.LONG.name());
    public static final PrimitiveType STRING = new PrimitiveType(Value.STRING, Value.STRING.name());
    public static final PrimitiveType BOOLEAN = new PrimitiveType(Value.BOOLEAN, Value.BOOLEAN.name());

    private final Value value;
    private final String string;

    private PrimitiveType(Value value, String string) {
        this.value = value;
        this.string = string;
    }

    public enum Value {
        INTEGER,
        DOUBLE,
        LONG,
        STRING,
        BOOLEAN,
        UNKNOWN
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

    public <T> T accept(Visitor<T> visitor) {
        switch (value) {
            case INTEGER:
                return visitor.visitInteger();
            case DOUBLE:
                return visitor.visitDouble();
            case LONG:
                return visitor.visitLong();
            case STRING:
                return visitor.visitString();
            case BOOLEAN:
                return visitor.visitBoolean();
            case UNKNOWN:
            default:
                return visitor.visitUnknown(string);
        }
    }

    public interface Visitor<T> {
        T visitInteger();

        T visitDouble();

        T visitLong();

        T visitString();

        T visitBoolean();

        T visitUnknown(String unknownValue);
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static PrimitiveType valueOf(@Nonnull String value) {
        String upperCasedValue = value.toUpperCase(Locale.ROOT);
        switch (upperCasedValue) {
            case "INTEGER":
                return INTEGER;
            case "DOUBLE":
                return DOUBLE;
            case "LONG":
                return LONG;
            case "STRING":
                return STRING;
            case "BOOLEAN":
                return BOOLEAN;
            default:
                return new PrimitiveType(Value.UNKNOWN, upperCasedValue);
        }
    }
}