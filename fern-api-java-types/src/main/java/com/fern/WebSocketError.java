package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

import java.util.Optional;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableWebSocketError.class)
public interface WebSocketError extends WithDocs {

    String name();

    Optional<TypeReference> bodyType();

    static ImmutableWebSocketError.NameBuildStage builder() {
        return ImmutableWebSocketError.builder();
    }
}
