package com.fern.ir.model.http;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.ir.core.ObjectMappers;
import java.lang.Object;
import java.lang.String;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_ABSENT)
@JsonDeserialize(builder = PathPagination.Builder.class)
public final class PathPagination {
    private final ResponseProperty nextPath;
    private final ResponseProperty results;

    private PathPagination(ResponseProperty nextPath, ResponseProperty results) {
        this.nextPath = nextPath;
        this.results = results;
    }

    @JsonProperty("nextPath")
    public ResponseProperty getNextPath() {
        return nextPath;
    }

    @JsonProperty("results")
    public ResponseProperty getResults() {
        return results;
    }

    @java.lang.Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof PathPagination && equalTo((PathPagination) other);
    }

    private boolean equalTo(PathPagination other) {
        return nextPath.equals(other.nextPath) && results.equals(other.results);
    }

    @java.lang.Override
    public int hashCode() {
        return Objects.hash(this.nextPath, this.results);
    }

    @java.lang.Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static NextPathStage builder() {
        return new Builder();
    }

    public interface NextPathStage {
        ResultsStage nextPath(ResponseProperty nextPath);

        Builder from(PathPagination other);
    }

    public interface ResultsStage {
        _FinalStage results(ResponseProperty results);
    }

    public interface _FinalStage {
        PathPagination build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements NextPathStage, ResultsStage, _FinalStage {
        private ResponseProperty nextPath;
        private ResponseProperty results;

        private Builder() {}

        @java.lang.Override
        public Builder from(PathPagination other) {
            nextPath(other.getNextPath());
            results(other.getResults());
            return this;
        }

        @java.lang.Override
        @JsonSetter("nextPath")
        public ResultsStage nextPath(ResponseProperty nextPath) {
            this.nextPath = Objects.requireNonNull(nextPath, "nextPath must not be null");
            return this;
        }

        @java.lang.Override
        @JsonSetter("results")
        public _FinalStage results(ResponseProperty results) {
            this.results = Objects.requireNonNull(results, "results must not be null");
            return this;
        }

        @java.lang.Override
        public PathPagination build() {
            return new PathPagination(nextPath, results);
        }
    }
}
