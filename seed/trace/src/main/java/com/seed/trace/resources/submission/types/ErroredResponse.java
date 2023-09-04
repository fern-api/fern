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
@JsonDeserialize(builder = ErroredResponse.Builder.class)
public final class ErroredResponse {
    private final UUID submissionId;

    private final ErrorInfo errorInfo;

    private ErroredResponse(UUID submissionId, ErrorInfo errorInfo) {
        this.submissionId = submissionId;
        this.errorInfo = errorInfo;
    }

    @JsonProperty("submissionId")
    public UUID getSubmissionId() {
        return submissionId;
    }

    @JsonProperty("errorInfo")
    public ErrorInfo getErrorInfo() {
        return errorInfo;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof ErroredResponse && equalTo((ErroredResponse) other);
    }

    private boolean equalTo(ErroredResponse other) {
        return submissionId.equals(other.submissionId) && errorInfo.equals(other.errorInfo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.submissionId, this.errorInfo);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static SubmissionIdStage builder() {
        return new Builder();
    }

    public interface SubmissionIdStage {
        ErrorInfoStage submissionId(UUID submissionId);

        Builder from(ErroredResponse other);
    }

    public interface ErrorInfoStage {
        _FinalStage errorInfo(ErrorInfo errorInfo);
    }

    public interface _FinalStage {
        ErroredResponse build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements SubmissionIdStage, ErrorInfoStage, _FinalStage {
        private UUID submissionId;

        private ErrorInfo errorInfo;

        private Builder() {}

        @Override
        public Builder from(ErroredResponse other) {
            submissionId(other.getSubmissionId());
            errorInfo(other.getErrorInfo());
            return this;
        }

        @Override
        @JsonSetter("submissionId")
        public ErrorInfoStage submissionId(UUID submissionId) {
            this.submissionId = submissionId;
            return this;
        }

        @Override
        @JsonSetter("errorInfo")
        public _FinalStage errorInfo(ErrorInfo errorInfo) {
            this.errorInfo = errorInfo;
            return this;
        }

        @Override
        public ErroredResponse build() {
            return new ErroredResponse(submissionId, errorInfo);
        }
    }
}
