package com.seed.trace.resources.submission.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.trace.core.ObjectMappers;
import java.util.Objects;
import java.util.Optional;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = InitializeProblemRequest.Builder.class)
public final class InitializeProblemRequest {
    private final String problemId;

    private final Optional<Integer> problemVersion;

    private InitializeProblemRequest(String problemId, Optional<Integer> problemVersion) {
        this.problemId = problemId;
        this.problemVersion = problemVersion;
    }

    @JsonProperty("problemId")
    public String getProblemId() {
        return problemId;
    }

    @JsonProperty("problemVersion")
    public Optional<Integer> getProblemVersion() {
        return problemVersion;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof InitializeProblemRequest && equalTo((InitializeProblemRequest) other);
    }

    private boolean equalTo(InitializeProblemRequest other) {
        return problemId.equals(other.problemId) && problemVersion.equals(other.problemVersion);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.problemId, this.problemVersion);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static ProblemIdStage builder() {
        return new Builder();
    }

    public interface ProblemIdStage {
        _FinalStage problemId(String problemId);

        Builder from(InitializeProblemRequest other);
    }

    public interface _FinalStage {
        InitializeProblemRequest build();

        _FinalStage problemVersion(Optional<Integer> problemVersion);

        _FinalStage problemVersion(Integer problemVersion);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements ProblemIdStage, _FinalStage {
        private String problemId;

        private Optional<Integer> problemVersion = Optional.empty();

        private Builder() {}

        @Override
        public Builder from(InitializeProblemRequest other) {
            problemId(other.getProblemId());
            problemVersion(other.getProblemVersion());
            return this;
        }

        @Override
        @JsonSetter("problemId")
        public _FinalStage problemId(String problemId) {
            this.problemId = problemId;
            return this;
        }

        @Override
        public _FinalStage problemVersion(Integer problemVersion) {
            this.problemVersion = Optional.of(problemVersion);
            return this;
        }

        @Override
        @JsonSetter(value = "problemVersion", nulls = Nulls.SKIP)
        public _FinalStage problemVersion(Optional<Integer> problemVersion) {
            this.problemVersion = problemVersion;
            return this;
        }

        @Override
        public InitializeProblemRequest build() {
            return new InitializeProblemRequest(problemId, problemVersion);
        }
    }
}
