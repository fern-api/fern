/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.fileUpload.model.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.fileUpload.core.ObjectMappers;
import java.util.Objects;
import java.util.Optional;

@JsonInclude(JsonInclude.Include.NON_ABSENT)
@JsonDeserialize(builder = MyObjectWithOptional.Builder.class)
public final class MyObjectWithOptional {
    private final String prop;

    private final Optional<String> optionalProp;

    private MyObjectWithOptional(String prop, Optional<String> optionalProp) {
        this.prop = prop;
        this.optionalProp = optionalProp;
    }

    @JsonProperty("prop")
    public String getProp() {
        return prop;
    }

    @JsonProperty("optionalProp")
    public Optional<String> getOptionalProp() {
        return optionalProp;
    }

    @java.lang.Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof MyObjectWithOptional && equalTo((MyObjectWithOptional) other);
    }

    private boolean equalTo(MyObjectWithOptional other) {
        return prop.equals(other.prop) && optionalProp.equals(other.optionalProp);
    }

    @java.lang.Override
    public int hashCode() {
        return Objects.hash(this.prop, this.optionalProp);
    }

    @java.lang.Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static PropStage builder() {
        return new Builder();
    }

    public interface PropStage {
        _FinalStage prop(String prop);

        Builder from(MyObjectWithOptional other);
    }

    public interface _FinalStage {
        MyObjectWithOptional build();

        _FinalStage optionalProp(Optional<String> optionalProp);

        _FinalStage optionalProp(String optionalProp);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements PropStage, _FinalStage {
        private String prop;

        private Optional<String> optionalProp = Optional.empty();

        private Builder() {}

        @java.lang.Override
        public Builder from(MyObjectWithOptional other) {
            prop(other.getProp());
            optionalProp(other.getOptionalProp());
            return this;
        }

        @java.lang.Override
        @JsonSetter("prop")
        public _FinalStage prop(String prop) {
            this.prop = Objects.requireNonNull(prop, "prop must not be null");
            return this;
        }

        @java.lang.Override
        public _FinalStage optionalProp(String optionalProp) {
            this.optionalProp = Optional.ofNullable(optionalProp);
            return this;
        }

        @java.lang.Override
        @JsonSetter(value = "optionalProp", nulls = Nulls.SKIP)
        public _FinalStage optionalProp(Optional<String> optionalProp) {
            this.optionalProp = optionalProp;
            return this;
        }

        @java.lang.Override
        public MyObjectWithOptional build() {
            return new MyObjectWithOptional(prop, optionalProp);
        }
    }
}
