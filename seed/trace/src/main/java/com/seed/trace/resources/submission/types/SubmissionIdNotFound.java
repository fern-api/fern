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
@JsonDeserialize(builder = SubmissionIdNotFound.Builder.class)
public final class SubmissionIdNotFound {
    private final UUID missingSubmissionId;

    private SubmissionIdNotFound(UUID missingSubmissionId) {
        this.missingSubmissionId = missingSubmissionId;
    }

    @JsonProperty("missingSubmissionId")
    public UUID getMissingSubmissionId() {
        return missingSubmissionId;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof SubmissionIdNotFound && equalTo((SubmissionIdNotFound) other);
    }

    private boolean equalTo(SubmissionIdNotFound other) {
        return missingSubmissionId.equals(other.missingSubmissionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.missingSubmissionId);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static MissingSubmissionIdStage builder() {
        return new Builder();
    }

    public interface MissingSubmissionIdStage {
        _FinalStage missingSubmissionId(UUID missingSubmissionId);

        Builder from(SubmissionIdNotFound other);
    }

    public interface _FinalStage {
        SubmissionIdNotFound build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements MissingSubmissionIdStage, _FinalStage {
        private UUID missingSubmissionId;

        private Builder() {}

        @Override
        public Builder from(SubmissionIdNotFound other) {
            missingSubmissionId(other.getMissingSubmissionId());
            return this;
        }

        @Override
        @JsonSetter("missingSubmissionId")
        public _FinalStage missingSubmissionId(UUID missingSubmissionId) {
            this.missingSubmissionId = missingSubmissionId;
            return this;
        }

        @Override
        public SubmissionIdNotFound build() {
            return new SubmissionIdNotFound(missingSubmissionId);
        }
    }
}
