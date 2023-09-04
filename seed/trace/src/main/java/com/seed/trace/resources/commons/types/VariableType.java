package com.seed.trace.resources.commons.types;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Objects;
import java.util.Optional;

public final class VariableType {
    private final Value value;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    private VariableType(Value value) {
        this.value = value;
    }

    public <T> T visit(Visitor<T> visitor) {
        return value.visit(visitor);
    }

    public static VariableType integerType() {
        return new VariableType(new IntegerTypeValue());
    }

    public static VariableType doubleType() {
        return new VariableType(new DoubleTypeValue());
    }

    public static VariableType booleanType() {
        return new VariableType(new BooleanTypeValue());
    }

    public static VariableType stringType() {
        return new VariableType(new StringTypeValue());
    }

    public static VariableType charType() {
        return new VariableType(new CharTypeValue());
    }

    public static VariableType listType(ListType value) {
        return new VariableType(new ListTypeValue(value));
    }

    public static VariableType mapType(MapType value) {
        return new VariableType(new MapTypeValue(value));
    }

    public static VariableType binaryTreeType() {
        return new VariableType(new BinaryTreeTypeValue());
    }

    public static VariableType singlyLinkedListType() {
        return new VariableType(new SinglyLinkedListTypeValue());
    }

    public static VariableType doublyLinkedListType() {
        return new VariableType(new DoublyLinkedListTypeValue());
    }

    public boolean isIntegerType() {
        return value instanceof IntegerTypeValue;
    }

    public boolean isDoubleType() {
        return value instanceof DoubleTypeValue;
    }

    public boolean isBooleanType() {
        return value instanceof BooleanTypeValue;
    }

    public boolean isStringType() {
        return value instanceof StringTypeValue;
    }

    public boolean isCharType() {
        return value instanceof CharTypeValue;
    }

    public boolean isListType() {
        return value instanceof ListTypeValue;
    }

    public boolean isMapType() {
        return value instanceof MapTypeValue;
    }

    public boolean isBinaryTreeType() {
        return value instanceof BinaryTreeTypeValue;
    }

    public boolean isSinglyLinkedListType() {
        return value instanceof SinglyLinkedListTypeValue;
    }

    public boolean isDoublyLinkedListType() {
        return value instanceof DoublyLinkedListTypeValue;
    }

    public boolean _isUnknown() {
        return value instanceof _UnknownValue;
    }

    public Optional<ListType> getListType() {
        if (isListType()) {
            return Optional.of(((ListTypeValue) value).value);
        }
        return Optional.empty();
    }

    public Optional<MapType> getMapType() {
        if (isMapType()) {
            return Optional.of(((MapTypeValue) value).value);
        }
        return Optional.empty();
    }

    public Optional<Object> _getUnknown() {
        if (_isUnknown()) {
            return Optional.of(((_UnknownValue) value).value);
        }
        return Optional.empty();
    }

    @JsonValue
    private Value getValue() {
        return this.value;
    }

    public interface Visitor<T> {
        T visitIntegerType();

        T visitDoubleType();

        T visitBooleanType();

        T visitStringType();

        T visitCharType();

        T visitListType(ListType listType);

        T visitMapType(MapType mapType);

        T visitBinaryTreeType();

        T visitSinglyLinkedListType();

        T visitDoublyLinkedListType();

        T _visitUnknown(Object unknownType);
    }

    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type", visible = true, defaultImpl = _UnknownValue.class)
    @JsonSubTypes({
        @JsonSubTypes.Type(IntegerTypeValue.class),
        @JsonSubTypes.Type(DoubleTypeValue.class),
        @JsonSubTypes.Type(BooleanTypeValue.class),
        @JsonSubTypes.Type(StringTypeValue.class),
        @JsonSubTypes.Type(CharTypeValue.class),
        @JsonSubTypes.Type(ListTypeValue.class),
        @JsonSubTypes.Type(MapTypeValue.class),
        @JsonSubTypes.Type(BinaryTreeTypeValue.class),
        @JsonSubTypes.Type(SinglyLinkedListTypeValue.class),
        @JsonSubTypes.Type(DoublyLinkedListTypeValue.class)
    })
    @JsonIgnoreProperties(ignoreUnknown = true)
    private interface Value {
        <T> T visit(Visitor<T> visitor);
    }

    @JsonTypeName("integerType")
    private static final class IntegerTypeValue implements Value {
        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private IntegerTypeValue() {}

        @Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitIntegerType();
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof IntegerTypeValue;
        }

        @Override
        public String toString() {
            return "VariableType{" + "}";
        }
    }

    @JsonTypeName("doubleType")
    private static final class DoubleTypeValue implements Value {
        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private DoubleTypeValue() {}

        @Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitDoubleType();
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof DoubleTypeValue;
        }

        @Override
        public String toString() {
            return "VariableType{" + "}";
        }
    }

    @JsonTypeName("booleanType")
    private static final class BooleanTypeValue implements Value {
        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private BooleanTypeValue() {}

        @Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitBooleanType();
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof BooleanTypeValue;
        }

        @Override
        public String toString() {
            return "VariableType{" + "}";
        }
    }

    @JsonTypeName("stringType")
    private static final class StringTypeValue implements Value {
        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private StringTypeValue() {}

        @Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitStringType();
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof StringTypeValue;
        }

        @Override
        public String toString() {
            return "VariableType{" + "}";
        }
    }

    @JsonTypeName("charType")
    private static final class CharTypeValue implements Value {
        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private CharTypeValue() {}

        @Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitCharType();
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof CharTypeValue;
        }

        @Override
        public String toString() {
            return "VariableType{" + "}";
        }
    }

    @JsonTypeName("listType")
    private static final class ListTypeValue implements Value {
        @JsonUnwrapped
        private ListType value;

        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private ListTypeValue() {}

        private ListTypeValue(ListType value) {
            this.value = value;
        }

        @Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitListType(value);
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof ListTypeValue && equalTo((ListTypeValue) other);
        }

        private boolean equalTo(ListTypeValue other) {
            return value.equals(other.value);
        }

        @Override
        public int hashCode() {
            return Objects.hash(this.value);
        }

        @Override
        public String toString() {
            return "VariableType{" + "value: " + value + "}";
        }
    }

    @JsonTypeName("mapType")
    private static final class MapTypeValue implements Value {
        @JsonUnwrapped
        private MapType value;

        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private MapTypeValue() {}

        private MapTypeValue(MapType value) {
            this.value = value;
        }

        @Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitMapType(value);
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof MapTypeValue && equalTo((MapTypeValue) other);
        }

        private boolean equalTo(MapTypeValue other) {
            return value.equals(other.value);
        }

        @Override
        public int hashCode() {
            return Objects.hash(this.value);
        }

        @Override
        public String toString() {
            return "VariableType{" + "value: " + value + "}";
        }
    }

    @JsonTypeName("binaryTreeType")
    private static final class BinaryTreeTypeValue implements Value {
        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private BinaryTreeTypeValue() {}

        @Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitBinaryTreeType();
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof BinaryTreeTypeValue;
        }

        @Override
        public String toString() {
            return "VariableType{" + "}";
        }
    }

    @JsonTypeName("singlyLinkedListType")
    private static final class SinglyLinkedListTypeValue implements Value {
        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private SinglyLinkedListTypeValue() {}

        @Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitSinglyLinkedListType();
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof SinglyLinkedListTypeValue;
        }

        @Override
        public String toString() {
            return "VariableType{" + "}";
        }
    }

    @JsonTypeName("doublyLinkedListType")
    private static final class DoublyLinkedListTypeValue implements Value {
        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private DoublyLinkedListTypeValue() {}

        @Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitDoublyLinkedListType();
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof DoublyLinkedListTypeValue;
        }

        @Override
        public String toString() {
            return "VariableType{" + "}";
        }
    }

    private static final class _UnknownValue implements Value {
        private String type;

        @JsonValue
        private Object value;

        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private _UnknownValue(@JsonProperty("value") Object value) {}

        @Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor._visitUnknown(value);
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof _UnknownValue && equalTo((_UnknownValue) other);
        }

        private boolean equalTo(_UnknownValue other) {
            return type.equals(other.type) && value.equals(other.value);
        }

        @Override
        public int hashCode() {
            return Objects.hash(this.type, this.value);
        }

        @Override
        public String toString() {
            return "VariableType{" + "type: " + type + ", value: " + value + "}";
        }
    }
}
