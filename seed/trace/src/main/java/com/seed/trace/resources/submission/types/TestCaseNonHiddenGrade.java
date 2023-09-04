package com.seed.trace.resources.submission.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.trace.core.ObjectMappers;
import com.seed.trace.resources.commons.types.VariableValue;
import java.util.Objects;
import java.util.Optional;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = TestCaseNonHiddenGrade.Builder.class)
public final class TestCaseNonHiddenGrade {
    private final boolean passed;

    private final Optional<VariableValue> actualResult;

    private final Optional<ExceptionV2> exception;

    private final String stdout;

    private TestCaseNonHiddenGrade(
            boolean passed, Optional<VariableValue> actualResult, Optional<ExceptionV2> exception, String stdout) {
        this.passed = passed;
        this.actualResult = actualResult;
        this.exception = exception;
        this.stdout = stdout;
    }

    @JsonProperty("passed")
    public boolean getPassed() {
        return passed;
    }

    @JsonProperty("actualResult")
    public Optional<VariableValue> getActualResult() {
        return actualResult;
    }

    @JsonProperty("exception")
    public Optional<ExceptionV2> getException() {
        return exception;
    }

    @JsonProperty("stdout")
    public String getStdout() {
        return stdout;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof TestCaseNonHiddenGrade && equalTo((TestCaseNonHiddenGrade) other);
    }

    private boolean equalTo(TestCaseNonHiddenGrade other) {
        return passed == other.passed
                && actualResult.equals(other.actualResult)
                && exception.equals(other.exception)
                && stdout.equals(other.stdout);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.passed, this.actualResult, this.exception, this.stdout);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static PassedStage builder() {
        return new Builder();
    }

    public interface PassedStage {
        StdoutStage passed(boolean passed);

        Builder from(TestCaseNonHiddenGrade other);
    }

    public interface StdoutStage {
        _FinalStage stdout(String stdout);
    }

    public interface _FinalStage {
        TestCaseNonHiddenGrade build();

        _FinalStage actualResult(Optional<VariableValue> actualResult);

        _FinalStage actualResult(VariableValue actualResult);

        _FinalStage exception(Optional<ExceptionV2> exception);

        _FinalStage exception(ExceptionV2 exception);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements PassedStage, StdoutStage, _FinalStage {
        private boolean passed;

        private String stdout;

        private Optional<ExceptionV2> exception = Optional.empty();

        private Optional<VariableValue> actualResult = Optional.empty();

        private Builder() {}

        @Override
        public Builder from(TestCaseNonHiddenGrade other) {
            passed(other.getPassed());
            actualResult(other.getActualResult());
            exception(other.getException());
            stdout(other.getStdout());
            return this;
        }

        @Override
        @JsonSetter("passed")
        public StdoutStage passed(boolean passed) {
            this.passed = passed;
            return this;
        }

        @Override
        @JsonSetter("stdout")
        public _FinalStage stdout(String stdout) {
            this.stdout = stdout;
            return this;
        }

        @Override
        public _FinalStage exception(ExceptionV2 exception) {
            this.exception = Optional.of(exception);
            return this;
        }

        @Override
        @JsonSetter(value = "exception", nulls = Nulls.SKIP)
        public _FinalStage exception(Optional<ExceptionV2> exception) {
            this.exception = exception;
            return this;
        }

        @Override
        public _FinalStage actualResult(VariableValue actualResult) {
            this.actualResult = Optional.of(actualResult);
            return this;
        }

        @Override
        @JsonSetter(value = "actualResult", nulls = Nulls.SKIP)
        public _FinalStage actualResult(Optional<VariableValue> actualResult) {
            this.actualResult = actualResult;
            return this;
        }

        @Override
        public TestCaseNonHiddenGrade build() {
            return new TestCaseNonHiddenGrade(passed, actualResult, exception, stdout);
        }
    }
}
