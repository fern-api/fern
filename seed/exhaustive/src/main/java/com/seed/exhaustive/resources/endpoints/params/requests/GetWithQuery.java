package com.seed.exhaustive.resources.endpoints.params.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.exhaustive.core.ObjectMappers;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = GetWithQuery.Builder.class)
public final class GetWithQuery {
    private final String query;

    private final int number;

    private GetWithQuery(String query, int number) {
        this.query = query;
        this.number = number;
    }

    @JsonProperty("query")
    public String getQuery() {
        return query;
    }

    @JsonProperty("number")
    public int getNumber() {
        return number;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof GetWithQuery && equalTo((GetWithQuery) other);
    }

    private boolean equalTo(GetWithQuery other) {
        return query.equals(other.query) && number == other.number;
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.query, this.number);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static QueryStage builder() {
        return new Builder();
    }

    public interface QueryStage {
        NumberStage query(String query);

        Builder from(GetWithQuery other);
    }

    public interface NumberStage {
        _FinalStage number(int number);
    }

    public interface _FinalStage {
        GetWithQuery build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements QueryStage, NumberStage, _FinalStage {
        private String query;

        private int number;

        private Builder() {}

        @Override
        public Builder from(GetWithQuery other) {
            query(other.getQuery());
            number(other.getNumber());
            return this;
        }

        @Override
        @JsonSetter("query")
        public NumberStage query(String query) {
            this.query = query;
            return this;
        }

        @Override
        @JsonSetter("number")
        public _FinalStage number(int number) {
            this.number = number;
            return this;
        }

        @Override
        public GetWithQuery build() {
            return new GetWithQuery(query, number);
        }
    }
}
