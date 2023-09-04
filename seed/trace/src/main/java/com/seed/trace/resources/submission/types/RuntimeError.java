package com.seed.trace.resources.submission.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.trace.core.ObjectMappers;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = RuntimeError.Builder.class)
public final class RuntimeError {
    private final String message;

    private RuntimeError(String message) {
        this.message = message;
    }

    @JsonProperty("message")
    public String getMessage() {
        return message;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof RuntimeError && equalTo((RuntimeError) other);
    }

    private boolean equalTo(RuntimeError other) {
        return message.equals(other.message);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.message);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static MessageStage builder() {
        return new Builder();
    }

    public interface MessageStage {
        _FinalStage message(String message);

        Builder from(RuntimeError other);
    }

    public interface _FinalStage {
        RuntimeError build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements MessageStage, _FinalStage {
        private String message;

        private Builder() {}

        @Override
        public Builder from(RuntimeError other) {
            message(other.getMessage());
            return this;
        }

        @Override
        @JsonSetter("message")
        public _FinalStage message(String message) {
            this.message = message;
            return this;
        }

        @Override
        public RuntimeError build() {
            return new RuntimeError(message);
        }
    }
}
