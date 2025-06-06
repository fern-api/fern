/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.mixedFileDirectory.resources.user.events.requests;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.mixedFileDirectory.core.ObjectMappers;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@JsonInclude(JsonInclude.Include.NON_ABSENT)
@JsonDeserialize(builder = ListUserEventsRequest.Builder.class)
public final class ListUserEventsRequest {
    private final Optional<Integer> limit;

    private final Map<String, Object> additionalProperties;

    private ListUserEventsRequest(Optional<Integer> limit, Map<String, Object> additionalProperties) {
        this.limit = limit;
        this.additionalProperties = additionalProperties;
    }

    /**
     * @return The maximum number of results to return.
     */
    @JsonProperty("limit")
    public Optional<Integer> getLimit() {
        return limit;
    }

    @java.lang.Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof ListUserEventsRequest && equalTo((ListUserEventsRequest) other);
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    private boolean equalTo(ListUserEventsRequest other) {
        return limit.equals(other.limit);
    }

    @java.lang.Override
    public int hashCode() {
        return Objects.hash(this.limit);
    }

    @java.lang.Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static Builder builder() {
        return new Builder();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder {
        private Optional<Integer> limit = Optional.empty();

        @JsonAnySetter
        private Map<String, Object> additionalProperties = new HashMap<>();

        private Builder() {}

        public Builder from(ListUserEventsRequest other) {
            limit(other.getLimit());
            return this;
        }

        /**
         * <p>The maximum number of results to return.</p>
         */
        @JsonSetter(value = "limit", nulls = Nulls.SKIP)
        public Builder limit(Optional<Integer> limit) {
            this.limit = limit;
            return this;
        }

        public Builder limit(Integer limit) {
            this.limit = Optional.ofNullable(limit);
            return this;
        }

        public ListUserEventsRequest build() {
            return new ListUserEventsRequest(limit, additionalProperties);
        }
    }
}
