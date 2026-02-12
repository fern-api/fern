package com.fern.ir.model.http;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fasterxml.jackson.annotation.JsonValue;
import java.lang.Object;
import java.lang.String;
import java.util.Objects;
import java.util.Optional;

public final class Pagination {
    private final Value value;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    private Pagination(Value value) {
        this.value = value;
    }

    public <T> T visit(Visitor<T> visitor) {
        return value.visit(visitor);
    }

    public static Pagination cursor(CursorPagination value) {
        return new Pagination(new CursorValue(value));
    }

    public static Pagination offset(OffsetPagination value) {
        return new Pagination(new OffsetValue(value));
    }

    public static Pagination custom(CustomPagination value) {
        return new Pagination(new CustomValue(value));
    }

    public static Pagination uri(UriPagination value) {
        return new Pagination(new UriValue(value));
    }

    public static Pagination path(PathPagination value) {
        return new Pagination(new PathValue(value));
    }

    public boolean isCursor() {
        return value instanceof CursorValue;
    }

    public boolean isOffset() {
        return value instanceof OffsetValue;
    }

    public boolean isCustom() {
        return value instanceof CustomValue;
    }

    public boolean isUri() {
        return value instanceof UriValue;
    }

    public boolean isPath() {
        return value instanceof PathValue;
    }

    public boolean _isUnknown() {
        return value instanceof _UnknownValue;
    }

    public Optional<CursorPagination> getCursor() {
        if (isCursor()) {
            return Optional.of(((CursorValue) value).value);
        }
        return Optional.empty();
    }

    public Optional<OffsetPagination> getOffset() {
        if (isOffset()) {
            return Optional.of(((OffsetValue) value).value);
        }
        return Optional.empty();
    }

    public Optional<CustomPagination> getCustom() {
        if (isCustom()) {
            return Optional.of(((CustomValue) value).value);
        }
        return Optional.empty();
    }

    public Optional<UriPagination> getUri() {
        if (isUri()) {
            return Optional.of(((UriValue) value).value);
        }
        return Optional.empty();
    }

    public Optional<PathPagination> getPath() {
        if (isPath()) {
            return Optional.of(((PathValue) value).value);
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
        T visitCursor(CursorPagination cursor);

        T visitOffset(OffsetPagination offset);

        T visitCustom(CustomPagination custom);

        T visitUri(UriPagination uri);

        T visitPath(PathPagination path);

        T _visitUnknown(Object unknownType);
    }

    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type", visible = true, defaultImpl = _UnknownValue.class)
    @JsonSubTypes({
        @JsonSubTypes.Type(CursorValue.class),
        @JsonSubTypes.Type(OffsetValue.class),
        @JsonSubTypes.Type(CustomValue.class),
        @JsonSubTypes.Type(UriValue.class),
        @JsonSubTypes.Type(PathValue.class)
    })
    @JsonIgnoreProperties(ignoreUnknown = true)
    private interface Value {
        <T> T visit(Visitor<T> visitor);
    }

    @JsonTypeName("cursor")
    @JsonIgnoreProperties("type")
    private static final class CursorValue implements Value {
        @JsonUnwrapped
        private CursorPagination value;

        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private CursorValue() {}

        private CursorValue(CursorPagination value) {
            this.value = value;
        }

        @java.lang.Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitCursor(value);
        }

        @java.lang.Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof CursorValue && equalTo((CursorValue) other);
        }

        private boolean equalTo(CursorValue other) {
            return value.equals(other.value);
        }

        @java.lang.Override
        public int hashCode() {
            return Objects.hash(this.value);
        }

        @java.lang.Override
        public String toString() {
            return "Pagination{" + "value: " + value + "}";
        }
    }

    @JsonTypeName("offset")
    @JsonIgnoreProperties("type")
    private static final class OffsetValue implements Value {
        @JsonUnwrapped
        private OffsetPagination value;

        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private OffsetValue() {}

        private OffsetValue(OffsetPagination value) {
            this.value = value;
        }

        @java.lang.Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitOffset(value);
        }

        @java.lang.Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof OffsetValue && equalTo((OffsetValue) other);
        }

        private boolean equalTo(OffsetValue other) {
            return value.equals(other.value);
        }

        @java.lang.Override
        public int hashCode() {
            return Objects.hash(this.value);
        }

        @java.lang.Override
        public String toString() {
            return "Pagination{" + "value: " + value + "}";
        }
    }

    @JsonTypeName("custom")
    @JsonIgnoreProperties("type")
    private static final class CustomValue implements Value {
        @JsonUnwrapped
        private CustomPagination value;

        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private CustomValue() {}

        private CustomValue(CustomPagination value) {
            this.value = value;
        }

        @java.lang.Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitCustom(value);
        }

        @java.lang.Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof CustomValue && equalTo((CustomValue) other);
        }

        private boolean equalTo(CustomValue other) {
            return value.equals(other.value);
        }

        @java.lang.Override
        public int hashCode() {
            return Objects.hash(this.value);
        }

        @java.lang.Override
        public String toString() {
            return "Pagination{" + "value: " + value + "}";
        }
    }

    @JsonTypeName("uri")
    @JsonIgnoreProperties("type")
    private static final class UriValue implements Value {
        @JsonUnwrapped
        private UriPagination value;

        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private UriValue() {}

        private UriValue(UriPagination value) {
            this.value = value;
        }

        @java.lang.Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitUri(value);
        }

        @java.lang.Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof UriValue && equalTo((UriValue) other);
        }

        private boolean equalTo(UriValue other) {
            return value.equals(other.value);
        }

        @java.lang.Override
        public int hashCode() {
            return Objects.hash(this.value);
        }

        @java.lang.Override
        public String toString() {
            return "Pagination{" + "value: " + value + "}";
        }
    }

    @JsonTypeName("path")
    @JsonIgnoreProperties("type")
    private static final class PathValue implements Value {
        @JsonUnwrapped
        private PathPagination value;

        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private PathValue() {}

        private PathValue(PathPagination value) {
            this.value = value;
        }

        @java.lang.Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor.visitPath(value);
        }

        @java.lang.Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof PathValue && equalTo((PathValue) other);
        }

        private boolean equalTo(PathValue other) {
            return value.equals(other.value);
        }

        @java.lang.Override
        public int hashCode() {
            return Objects.hash(this.value);
        }

        @java.lang.Override
        public String toString() {
            return "Pagination{" + "value: " + value + "}";
        }
    }

    @JsonIgnoreProperties("type")
    private static final class _UnknownValue implements Value {
        private String type;

        @JsonValue
        private Object value;

        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        private _UnknownValue(@JsonProperty("value") Object value) {}

        @java.lang.Override
        public <T> T visit(Visitor<T> visitor) {
            return visitor._visitUnknown(value);
        }

        @java.lang.Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof _UnknownValue && equalTo((_UnknownValue) other);
        }

        private boolean equalTo(_UnknownValue other) {
            return type.equals(other.type) && value.equals(other.value);
        }

        @java.lang.Override
        public int hashCode() {
            return Objects.hash(this.type, this.value);
        }

        @java.lang.Override
        public String toString() {
            return "Pagination{" + "type: " + type + ", value: " + value + "}";
        }
    }
}
