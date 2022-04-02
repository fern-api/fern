package com.fern;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import javax.annotation.Nonnull;
import java.util.Locale;

public final class AllowedPrimitiveMapKeyType {

    public static final PrimitiveType INTEGER = PrimitiveType.INTEGER;
    public static final PrimitiveType STRING = PrimitiveType.STRING;
    public static final PrimitiveType BOOLEAN = PrimitiveType.BOOLEAN;

    private PrimitiveType primitiveType;

    private AllowedPrimitiveMapKeyType(PrimitiveType primitiveType) {
        this.primitiveType = primitiveType;
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static AllowedPrimitiveMapKeyType valueOf(@Nonnull String value) {
        String upperCasedValue = value.toUpperCase(Locale.ROOT);
        switch (upperCasedValue) {
            case "INTEGER":
                return new AllowedPrimitiveMapKeyType(INTEGER);
            case "STRING":
                return new AllowedPrimitiveMapKeyType(STRING);
            case "BOOLEAN":
                return new AllowedPrimitiveMapKeyType(BOOLEAN);
            default:
                PrimitiveType unknown = PrimitiveType.valueOf("UNKNOWN");
                return new AllowedPrimitiveMapKeyType(unknown);
        }
    }

    public PrimitiveType.Value getEnumValue() {
        return primitiveType.getEnumValue();
    }

    @Override
    @JsonValue
    public String toString() {
        return primitiveType.toString();
    }

    @Override
    public boolean equals(Object other) {
        return primitiveType.equals(other);
    }

    @Override
    public int hashCode() {
        return this.primitiveType.hashCode();
    }

    public <T> T accept(PrimitiveType.Visitor<T> visitor) {
        switch (primitiveType.getEnumValue()) {
            case INTEGER:
                return visitor.visitInteger();
            case STRING:
                return visitor.visitString();
            case BOOLEAN:
                return visitor.visitBoolean();
            default:
                return visitor.visitUnknown(primitiveType.toString());
        }
    }

    public interface Visitor<T> {
        T visitInteger();

        T visitString();

        T visitBoolean();

        T visitUnknown(String unknownValue);
    }
}
