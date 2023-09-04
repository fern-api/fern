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
@JsonDeserialize(builder = StdoutResponse.Builder.class)
public final class StdoutResponse {
    private final UUID submissionId;

    private final String stdout;

    private StdoutResponse(UUID submissionId, String stdout) {
        this.submissionId = submissionId;
        this.stdout = stdout;
    }

    @JsonProperty("submissionId")
    public UUID getSubmissionId() {
        return submissionId;
    }

    @JsonProperty("stdout")
    public String getStdout() {
        return stdout;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof StdoutResponse && equalTo((StdoutResponse) other);
    }

    private boolean equalTo(StdoutResponse other) {
        return submissionId.equals(other.submissionId) && stdout.equals(other.stdout);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.submissionId, this.stdout);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static SubmissionIdStage builder() {
        return new Builder();
    }

    public interface SubmissionIdStage {
        StdoutStage submissionId(UUID submissionId);

        Builder from(StdoutResponse other);
    }

    public interface StdoutStage {
        _FinalStage stdout(String stdout);
    }

    public interface _FinalStage {
        StdoutResponse build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements SubmissionIdStage, StdoutStage, _FinalStage {
        private UUID submissionId;

        private String stdout;

        private Builder() {}

        @Override
        public Builder from(StdoutResponse other) {
            submissionId(other.getSubmissionId());
            stdout(other.getStdout());
            return this;
        }

        @Override
        @JsonSetter("submissionId")
        public StdoutStage submissionId(UUID submissionId) {
            this.submissionId = submissionId;
            return this;
        }

        @Override
        @JsonSetter("stdout")
        public _FinalStage stdout(String stdout) {
            this.stdout = stdout;
            return this;
        }

        @Override
        public StdoutResponse build() {
            return new StdoutResponse(submissionId, stdout);
        }
    }
}
