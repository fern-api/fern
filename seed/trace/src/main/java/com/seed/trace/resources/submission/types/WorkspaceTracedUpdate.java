package com.seed.trace.resources.submission.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.trace.core.ObjectMappers;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = WorkspaceTracedUpdate.Builder.class)
public final class WorkspaceTracedUpdate {
    private final int traceResponsesSize;

    private WorkspaceTracedUpdate(int traceResponsesSize) {
        this.traceResponsesSize = traceResponsesSize;
    }

    @JsonProperty("traceResponsesSize")
    public int getTraceResponsesSize() {
        return traceResponsesSize;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof WorkspaceTracedUpdate && equalTo((WorkspaceTracedUpdate) other);
    }

    private boolean equalTo(WorkspaceTracedUpdate other) {
        return traceResponsesSize == other.traceResponsesSize;
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.traceResponsesSize);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static TraceResponsesSizeStage builder() {
        return new Builder();
    }

    public interface TraceResponsesSizeStage {
        _FinalStage traceResponsesSize(int traceResponsesSize);

        Builder from(WorkspaceTracedUpdate other);
    }

    public interface _FinalStage {
        WorkspaceTracedUpdate build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements TraceResponsesSizeStage, _FinalStage {
        private int traceResponsesSize;

        private Builder() {}

        @Override
        public Builder from(WorkspaceTracedUpdate other) {
            traceResponsesSize(other.getTraceResponsesSize());
            return this;
        }

        @Override
        @JsonSetter("traceResponsesSize")
        public _FinalStage traceResponsesSize(int traceResponsesSize) {
            this.traceResponsesSize = traceResponsesSize;
            return this;
        }

        @Override
        public WorkspaceTracedUpdate build() {
            return new WorkspaceTracedUpdate(traceResponsesSize);
        }
    }
}
