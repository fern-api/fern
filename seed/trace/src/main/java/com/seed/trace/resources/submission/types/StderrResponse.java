package com.seed.trace.resources.submission.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.trace.core.ObjectMappers;
import java.util.Objects;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = StderrResponse.Builder.class)
public final class StderrResponse {
    private final UUID submissionId;

    private final String stderr;

    private StderrResponse(UUID submissionId, String stderr) {
        this.submissionId = submissionId;
        this.stderr = stderr;
    }

    @JsonProperty("submissionId")
    public UUID getSubmissionId() {
        return submissionId;
    }

    @JsonProperty("stderr")
    public String getStderr() {
        return stderr;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof StderrResponse && equalTo((StderrResponse) other);
    }

    private boolean equalTo(StderrResponse other) {
        return submissionId.equals(other.submissionId) && stderr.equals(other.stderr);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.submissionId, this.stderr);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static SubmissionIdStage builder() {
        return new Builder();
    }

    public interface SubmissionIdStage {
        StderrStage submissionId(UUID submissionId);

        Builder from(StderrResponse other);
    }

    public interface StderrStage {
        _FinalStage stderr(String stderr);
    }

    public interface _FinalStage {
        StderrResponse build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements SubmissionIdStage, StderrStage, _FinalStage {
        private UUID submissionId;

        private String stderr;

        private Builder() {}

        @Override
        public Builder from(StderrResponse other) {
            submissionId(other.getSubmissionId());
            stderr(other.getStderr());
            return this;
        }

        @Override
        @JsonSetter("submissionId")
        public StderrStage submissionId(UUID submissionId) {
            this.submissionId = submissionId;
            return this;
        }

        @Override
        @JsonSetter("stderr")
        public _FinalStage stderr(String stderr) {
            this.stderr = stderr;
            return this;
        }

        @Override
        public StderrResponse build() {
            return new StderrResponse(submissionId, stderr);
        }
    }
}
