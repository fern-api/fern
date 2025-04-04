/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.api.resources.ast.types;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.api.core.ObjectMappers;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import org.jetbrains.annotations.NotNull;

@JsonInclude(JsonInclude.Include.NON_ABSENT)
@JsonDeserialize(builder = FirstUnionSecondElement.Builder.class)
public final class FirstUnionSecondElement {
    private final SecondUnion child;

    private final Map<String, Object> additionalProperties;

    private FirstUnionSecondElement(SecondUnion child, Map<String, Object> additionalProperties) {
        this.child = child;
        this.additionalProperties = additionalProperties;
    }

    @JsonProperty("child")
    public SecondUnion getChild() {
        return child;
    }

    @java.lang.Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof FirstUnionSecondElement && equalTo((FirstUnionSecondElement) other);
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    private boolean equalTo(FirstUnionSecondElement other) {
        return child.equals(other.child);
    }

    @java.lang.Override
    public int hashCode() {
        return Objects.hash(this.child);
    }

    @java.lang.Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static ChildStage builder() {
        return new Builder();
    }

    public interface ChildStage {
        _FinalStage child(@NotNull SecondUnion child);

        Builder from(FirstUnionSecondElement other);
    }

    public interface _FinalStage {
        FirstUnionSecondElement build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements ChildStage, _FinalStage {
        private SecondUnion child;

        @JsonAnySetter
        private Map<String, Object> additionalProperties = new HashMap<>();

        private Builder() {}

        @java.lang.Override
        public Builder from(FirstUnionSecondElement other) {
            child(other.getChild());
            return this;
        }

        @java.lang.Override
        @JsonSetter("child")
        public _FinalStage child(@NotNull SecondUnion child) {
            this.child = Objects.requireNonNull(child, "child must not be null");
            return this;
        }

        @java.lang.Override
        public FirstUnionSecondElement build() {
            return new FirstUnionSecondElement(child, additionalProperties);
        }
    }
}
