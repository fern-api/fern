package com.seed.trace.resources.v2.v3.problem.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.trace.core.ObjectMappers;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = DeepEqualityCorrectnessCheck.Builder.class)
public final class DeepEqualityCorrectnessCheck {
    private final String expectedValueParameterId;

    private DeepEqualityCorrectnessCheck(String expectedValueParameterId) {
        this.expectedValueParameterId = expectedValueParameterId;
    }

    @JsonProperty("expectedValueParameterId")
    public String getExpectedValueParameterId() {
        return expectedValueParameterId;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof DeepEqualityCorrectnessCheck && equalTo((DeepEqualityCorrectnessCheck) other);
    }

    private boolean equalTo(DeepEqualityCorrectnessCheck other) {
        return expectedValueParameterId.equals(other.expectedValueParameterId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.expectedValueParameterId);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static ExpectedValueParameterIdStage builder() {
        return new Builder();
    }

    public interface ExpectedValueParameterIdStage {
        _FinalStage expectedValueParameterId(String expectedValueParameterId);

        Builder from(DeepEqualityCorrectnessCheck other);
    }

    public interface _FinalStage {
        DeepEqualityCorrectnessCheck build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements ExpectedValueParameterIdStage, _FinalStage {
        private String expectedValueParameterId;

        private Builder() {}

        @Override
        public Builder from(DeepEqualityCorrectnessCheck other) {
            expectedValueParameterId(other.getExpectedValueParameterId());
            return this;
        }

        @Override
        @JsonSetter("expectedValueParameterId")
        public _FinalStage expectedValueParameterId(String expectedValueParameterId) {
            this.expectedValueParameterId = expectedValueParameterId;
            return this;
        }

        @Override
        public DeepEqualityCorrectnessCheck build() {
            return new DeepEqualityCorrectnessCheck(expectedValueParameterId);
        }
    }
}
