package com.seed.exhaustive.resources.endpoints.params.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = GetWithMultipleQuery.Builder.class)
public final class GetWithMultipleQuery {
    private final String query;

    private final int numer;

    private GetWithMultipleQuery(String query, int numer) {
        this.query = query;
        this.numer = numer;
    }

    @JsonProperty("query")
    public String getQuery() {
        return query;
    }

    @JsonProperty("numer")
    public int getNumer() {
        return numer;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof GetWithMultipleQuery && equalTo((GetWithMultipleQuery) other);
    }

    private boolean equalTo(GetWithMultipleQuery other) {
        return query.equals(other.query) && numer == other.numer;
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.query, this.numer);
    }

    @Override
    public String toString() {
        return "GetWithMultipleQuery{" + "query: " + query + ", numer: " + numer + "}";
    }

    public static QueryStage builder() {
        return new Builder();
    }

    public interface QueryStage {
        NumerStage query(String query);

        Builder from(GetWithMultipleQuery other);
    }

    public interface NumerStage {
        _FinalStage numer(int numer);
    }

    public interface _FinalStage {
        GetWithMultipleQuery build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements QueryStage, NumerStage, _FinalStage {
        private String query;

        private int numer;

        private Builder() {}

        @Override
        public Builder from(GetWithMultipleQuery other) {
            query(other.getQuery());
            numer(other.getNumer());
            return this;
        }

        @Override
        @JsonSetter("query")
        public NumerStage query(String query) {
            this.query = query;
            return this;
        }

        @Override
        @JsonSetter("numer")
        public _FinalStage numer(int numer) {
            this.numer = numer;
            return this;
        }

        @Override
        public GetWithMultipleQuery build() {
            return new GetWithMultipleQuery(query, numer);
        }
    }
}
