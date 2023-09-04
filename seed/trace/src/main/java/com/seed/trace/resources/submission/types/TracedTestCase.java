package com.seed.trace.resources.submission.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.trace.core.ObjectMappers;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = TracedTestCase.Builder.class)
public final class TracedTestCase {
    private final TestCaseResultWithStdout result;

    private final int traceResponsesSize;

    private TracedTestCase(TestCaseResultWithStdout result, int traceResponsesSize) {
        this.result = result;
        this.traceResponsesSize = traceResponsesSize;
    }

    @JsonProperty("result")
    public TestCaseResultWithStdout getResult() {
        return result;
    }

    @JsonProperty("traceResponsesSize")
    public int getTraceResponsesSize() {
        return traceResponsesSize;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof TracedTestCase && equalTo((TracedTestCase) other);
    }

    private boolean equalTo(TracedTestCase other) {
        return result.equals(other.result) && traceResponsesSize == other.traceResponsesSize;
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.result, this.traceResponsesSize);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static ResultStage builder() {
        return new Builder();
    }

    public interface ResultStage {
        TraceResponsesSizeStage result(TestCaseResultWithStdout result);

        Builder from(TracedTestCase other);
    }

    public interface TraceResponsesSizeStage {
        _FinalStage traceResponsesSize(int traceResponsesSize);
    }

    public interface _FinalStage {
        TracedTestCase build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements ResultStage, TraceResponsesSizeStage, _FinalStage {
        private TestCaseResultWithStdout result;

        private int traceResponsesSize;

        private Builder() {}

        @Override
        public Builder from(TracedTestCase other) {
            result(other.getResult());
            traceResponsesSize(other.getTraceResponsesSize());
            return this;
        }

        @Override
        @JsonSetter("result")
        public TraceResponsesSizeStage result(TestCaseResultWithStdout result) {
            this.result = result;
            return this;
        }

        @Override
        @JsonSetter("traceResponsesSize")
        public _FinalStage traceResponsesSize(int traceResponsesSize) {
            this.traceResponsesSize = traceResponsesSize;
            return this;
        }

        @Override
        public TracedTestCase build() {
            return new TracedTestCase(result, traceResponsesSize);
        }
    }
}
