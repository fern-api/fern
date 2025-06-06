/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.object.types;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.seed.object.core.ObjectMappers;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.jetbrains.annotations.NotNull;

@JsonDeserialize(using = UndiscriminatedUnionTypeWithAliasListVariant.Deserializer.class)
public final class UndiscriminatedUnionTypeWithAliasListVariant {
    private final Object value;

    private final int type;

    private UndiscriminatedUnionTypeWithAliasListVariant(Object value, int type) {
        this.value = value;
        this.type = type;
    }

    @JsonValue
    public Object get() {
        return this.value;
    }

    public <T> T visit(Visitor<T> visitor) {
        if (this.type == 0) {
            return visitor.visit((List<AliasVariantType>) this.value);
        }
        throw new IllegalStateException("Failed to visit value. This should never happen.");
    }

    @java.lang.Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof UndiscriminatedUnionTypeWithAliasListVariant
                && equalTo((UndiscriminatedUnionTypeWithAliasListVariant) other);
    }

    private boolean equalTo(UndiscriminatedUnionTypeWithAliasListVariant other) {
        return value.equals(other.value);
    }

    @java.lang.Override
    public int hashCode() {
        return Objects.hash(this.value);
    }

    @java.lang.Override
    public String toString() {
        return this.value.toString();
    }

    public static UndiscriminatedUnionTypeWithAliasListVariant of(List<AliasVariantType> value) {
        return new UndiscriminatedUnionTypeWithAliasListVariant(value, 0);
    }

    public interface Visitor<T> {
        T visit(List<AliasVariantType> value);
    }

    static final class Deserializer extends StdDeserializer<UndiscriminatedUnionTypeWithAliasListVariant> {
        Deserializer() {
            super(UndiscriminatedUnionTypeWithAliasListVariant.class);
        }

        @java.lang.Override
        public UndiscriminatedUnionTypeWithAliasListVariant deserialize(JsonParser p, DeserializationContext context)
                throws IOException {
            Object value = p.readValueAs(Object.class);
            try {
                return of(
                        ObjectMappers.JSON_MAPPER.convertValue(value, new TypeReference<List<AliasVariantType>>() {}));
            } catch (IllegalArgumentException e) {
            }
            throw new JsonParseException(p, "Failed to deserialize");
        }
    }

    @JsonInclude(JsonInclude.Include.NON_ABSENT)
    @JsonDeserialize(builder = AliasVariantType.Builder.class)
    public static final class AliasVariantType {
        private final String prop;

        private final Map<String, Object> additionalProperties;

        private AliasVariantType(String prop, Map<String, Object> additionalProperties) {
            this.prop = prop;
            this.additionalProperties = additionalProperties;
        }

        @JsonProperty("prop")
        public String getProp() {
            return prop;
        }

        @java.lang.Override
        public boolean equals(Object other) {
            if (this == other) return true;
            return other instanceof AliasVariantType && equalTo((AliasVariantType) other);
        }

        @JsonAnyGetter
        public Map<String, Object> getAdditionalProperties() {
            return this.additionalProperties;
        }

        private boolean equalTo(AliasVariantType other) {
            return prop.equals(other.prop);
        }

        @java.lang.Override
        public int hashCode() {
            return Objects.hash(this.prop);
        }

        @java.lang.Override
        public String toString() {
            return ObjectMappers.stringify(this);
        }

        public static PropStage builder() {
            return new Builder();
        }

        public interface PropStage {
            _FinalStage prop(@NotNull String prop);

            Builder from(AliasVariantType other);
        }

        public interface _FinalStage {
            AliasVariantType build();
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static final class Builder implements PropStage, _FinalStage {
            private String prop;

            @JsonAnySetter
            private Map<String, Object> additionalProperties = new HashMap<>();

            private Builder() {}

            @java.lang.Override
            public Builder from(AliasVariantType other) {
                prop(other.getProp());
                return this;
            }

            @java.lang.Override
            @JsonSetter("prop")
            public _FinalStage prop(@NotNull String prop) {
                this.prop = Objects.requireNonNull(prop, "prop must not be null");
                return this;
            }

            @java.lang.Override
            public AliasVariantType build() {
                return new AliasVariantType(prop, additionalProperties);
            }
        }
    }
}
