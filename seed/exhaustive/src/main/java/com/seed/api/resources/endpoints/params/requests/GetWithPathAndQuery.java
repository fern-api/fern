package com.seed.api.resources.endpoints.params.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = GetWithPathAndQuery.Builder.class)
public final class GetWithPathAndQuery {
    private final String query;

    private GetWithPathAndQuery(String query) {
        this.query = query;
    }

    @JsonProperty("query")
    public String getQuery() {
        return query;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof GetWithPathAndQuery && equalTo((GetWithPathAndQuery) other);
    }

    private boolean equalTo(GetWithPathAndQuery other) {
        return query.equals(other.query);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.query);
    }

    @Override
    public String toString() {
        return "GetWithPathAndQuery{" + "query: " + query + "}";
    }

    public static QueryStage builder() {
        return new Builder();
    }

    public interface QueryStage {
        _FinalStage query(String query);

        Builder from(GetWithPathAndQuery other);
    }

    public interface _FinalStage {
        GetWithPathAndQuery build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements QueryStage, _FinalStage {
        private String query;

        private Builder() {}

        @Override
        public Builder from(GetWithPathAndQuery other) {
            query(other.getQuery());
            return this;
        }

        @Override
        @JsonSetter("query")
        public _FinalStage query(String query) {
            this.query = query;
            return this;
        }

        @Override
        public GetWithPathAndQuery build() {
            return new GetWithPathAndQuery(query);
        }
    }
}
