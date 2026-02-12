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
@JsonDeserialize(builder = UriPagination.Builder.class)
public final class UriPagination {
    private final ResponseProperty nextUri;
    private final ResponseProperty results;

    private UriPagination(ResponseProperty nextUri, ResponseProperty results) {
        this.nextUri = nextUri;
        this.results = results;
    }

    @JsonProperty("nextUri")
    public ResponseProperty getNextUri() {
        return nextUri;
    }

    @JsonProperty("results")
    public ResponseProperty getResults() {
        return results;
    }

    @java.lang.Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof UriPagination && equalTo((UriPagination) other);
    }

    private boolean equalTo(UriPagination other) {
        return nextUri.equals(other.nextUri) && results.equals(other.results);
    }

    @java.lang.Override
    public int hashCode() {
        return Objects.hash(this.nextUri, this.results);
    }

    @java.lang.Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static NextUriStage builder() {
        return new Builder();
    }

    public interface NextUriStage {
        ResultsStage nextUri(ResponseProperty nextUri);

        Builder from(UriPagination other);
    }

    public interface ResultsStage {
        _FinalStage results(ResponseProperty results);
    }

    public interface _FinalStage {
        UriPagination build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements NextUriStage, ResultsStage, _FinalStage {
        private ResponseProperty nextUri;
        private ResponseProperty results;

        private Builder() {}

        @java.lang.Override
        public Builder from(UriPagination other) {
            nextUri(other.getNextUri());
            results(other.getResults());
            return this;
        }

        @java.lang.Override
        @JsonSetter("nextUri")
        public ResultsStage nextUri(ResponseProperty nextUri) {
            this.nextUri = Objects.requireNonNull(nextUri, "nextUri must not be null");
            return this;
        }

        @java.lang.Override
        @JsonSetter("results")
        public _FinalStage results(ResponseProperty results) {
            this.results = Objects.requireNonNull(results, "results must not be null");
            return this;
        }

        @java.lang.Override
        public UriPagination build() {
            return new UriPagination(nextUri, results);
        }
    }
}
