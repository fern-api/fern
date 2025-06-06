/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.pagination.resources.users.requests;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.pagination.core.ObjectMappers;
import com.seed.pagination.resources.users.types.Order;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@JsonInclude(JsonInclude.Include.NON_ABSENT)
@JsonDeserialize(builder = ListUsersDoubleOffsetPaginationRequest.Builder.class)
public final class ListUsersDoubleOffsetPaginationRequest {
    private final Optional<Double> page;

    private final Optional<Double> perPage;

    private final Optional<Order> order;

    private final Optional<String> startingAfter;

    private final Map<String, Object> additionalProperties;

    private ListUsersDoubleOffsetPaginationRequest(
            Optional<Double> page,
            Optional<Double> perPage,
            Optional<Order> order,
            Optional<String> startingAfter,
            Map<String, Object> additionalProperties) {
        this.page = page;
        this.perPage = perPage;
        this.order = order;
        this.startingAfter = startingAfter;
        this.additionalProperties = additionalProperties;
    }

    /**
     * @return Defaults to first page
     */
    @JsonProperty("page")
    public Optional<Double> getPage() {
        return page;
    }

    /**
     * @return Defaults to per page
     */
    @JsonProperty("per_page")
    public Optional<Double> getPerPage() {
        return perPage;
    }

    @JsonProperty("order")
    public Optional<Order> getOrder() {
        return order;
    }

    /**
     * @return The cursor used for pagination in order to fetch
     * the next page of results.
     */
    @JsonProperty("starting_after")
    public Optional<String> getStartingAfter() {
        return startingAfter;
    }

    @java.lang.Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof ListUsersDoubleOffsetPaginationRequest
                && equalTo((ListUsersDoubleOffsetPaginationRequest) other);
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    private boolean equalTo(ListUsersDoubleOffsetPaginationRequest other) {
        return page.equals(other.page)
                && perPage.equals(other.perPage)
                && order.equals(other.order)
                && startingAfter.equals(other.startingAfter);
    }

    @java.lang.Override
    public int hashCode() {
        return Objects.hash(this.page, this.perPage, this.order, this.startingAfter);
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
        private Optional<Double> page = Optional.empty();

        private Optional<Double> perPage = Optional.empty();

        private Optional<Order> order = Optional.empty();

        private Optional<String> startingAfter = Optional.empty();

        @JsonAnySetter
        private Map<String, Object> additionalProperties = new HashMap<>();

        private Builder() {}

        public Builder from(ListUsersDoubleOffsetPaginationRequest other) {
            page(other.getPage());
            perPage(other.getPerPage());
            order(other.getOrder());
            startingAfter(other.getStartingAfter());
            return this;
        }

        /**
         * <p>Defaults to first page</p>
         */
        @JsonSetter(value = "page", nulls = Nulls.SKIP)
        public Builder page(Optional<Double> page) {
            this.page = page;
            return this;
        }

        public Builder page(Double page) {
            this.page = Optional.ofNullable(page);
            return this;
        }

        /**
         * <p>Defaults to per page</p>
         */
        @JsonSetter(value = "per_page", nulls = Nulls.SKIP)
        public Builder perPage(Optional<Double> perPage) {
            this.perPage = perPage;
            return this;
        }

        public Builder perPage(Double perPage) {
            this.perPage = Optional.ofNullable(perPage);
            return this;
        }

        @JsonSetter(value = "order", nulls = Nulls.SKIP)
        public Builder order(Optional<Order> order) {
            this.order = order;
            return this;
        }

        public Builder order(Order order) {
            this.order = Optional.ofNullable(order);
            return this;
        }

        /**
         * <p>The cursor used for pagination in order to fetch
         * the next page of results.</p>
         */
        @JsonSetter(value = "starting_after", nulls = Nulls.SKIP)
        public Builder startingAfter(Optional<String> startingAfter) {
            this.startingAfter = startingAfter;
            return this;
        }

        public Builder startingAfter(String startingAfter) {
            this.startingAfter = Optional.ofNullable(startingAfter);
            return this;
        }

        public ListUsersDoubleOffsetPaginationRequest build() {
            return new ListUsersDoubleOffsetPaginationRequest(
                    page, perPage, order, startingAfter, additionalProperties);
        }
    }
}
