package com.fern.java.client.generators.endpoint;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fern.ir.model.commons.Name;
import org.immutables.value.Value;

// TODO(ajgateno): This will be necessary until the required IR changes include more information about the path
@Value.Immutable
@JsonSerialize(as = ImmutableEnrichedCursorPathItem.class)
@JsonDeserialize(as = ImmutableEnrichedCursorPathItem.class)
public interface EnrichedCursorPathItem {

    @JsonProperty("name")
    Name name();

    @Value.Default
    @JsonProperty("optional")
    default boolean optional() {
        return false;
    }

    // TODO(ajgateno): Check for wrapped aliases and add a .value to getter if necessary
    @Value.Default
    @JsonProperty("alias")
    default boolean alias() {
        return false;
    }

    static ImmutableEnrichedCursorPathItem.Builder builder() {
        return ImmutableEnrichedCursorPathItem.builder();
    }
}
