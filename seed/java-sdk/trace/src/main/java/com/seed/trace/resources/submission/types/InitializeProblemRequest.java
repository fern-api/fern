/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.trace.resources.submission.types;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.trace.core.ObjectMappers;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.jetbrains.annotations.NotNull;

@JsonInclude(JsonInclude.Include.NON_ABSENT)
@JsonDeserialize(builder = InitializeProblemRequest.Builder.class)
public final class InitializeProblemRequest {
    private final String problemId;

    private final Optional<Integer> problemVersion;

    private final Map<String, Object> additionalProperties;

    private InitializeProblemRequest(
            String problemId, Optional<Integer> problemVersion, Map<String, Object> additionalProperties) {
        this.problemId = problemId;
        this.problemVersion = problemVersion;
        this.additionalProperties = additionalProperties;
    }

    @JsonProperty("problemId")
    public String getProblemId() {
        return problemId;
    }

    @JsonProperty("problemVersion")
    public Optional<Integer> getProblemVersion() {
        return problemVersion;
    }

    @java.lang.Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof InitializeProblemRequest && equalTo((InitializeProblemRequest) other);
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    private boolean equalTo(InitializeProblemRequest other) {
        return problemId.equals(other.problemId) && problemVersion.equals(other.problemVersion);
    }

    @java.lang.Override
    public int hashCode() {
        return Objects.hash(this.problemId, this.problemVersion);
    }

    @java.lang.Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static ProblemIdStage builder() {
        return new Builder();
    }

    public interface ProblemIdStage {
        _FinalStage problemId(@NotNull String problemId);

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

        @JsonAnySetter
        private Map<String, Object> additionalProperties = new HashMap<>();

        private Builder() {}

        @java.lang.Override
        public Builder from(InitializeProblemRequest other) {
            problemId(other.getProblemId());
            problemVersion(other.getProblemVersion());
            return this;
        }

        @java.lang.Override
        @JsonSetter("problemId")
        public _FinalStage problemId(@NotNull String problemId) {
            this.problemId = Objects.requireNonNull(problemId, "problemId must not be null");
            return this;
        }

        @java.lang.Override
        public _FinalStage problemVersion(Integer problemVersion) {
            this.problemVersion = Optional.ofNullable(problemVersion);
            return this;
        }

        @java.lang.Override
        @JsonSetter(value = "problemVersion", nulls = Nulls.SKIP)
        public _FinalStage problemVersion(Optional<Integer> problemVersion) {
            this.problemVersion = problemVersion;
            return this;
        }

        @java.lang.Override
        public InitializeProblemRequest build() {
            return new InitializeProblemRequest(problemId, problemVersion, additionalProperties);
        }
    }
}
