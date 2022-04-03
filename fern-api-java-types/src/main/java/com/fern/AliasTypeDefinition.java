package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableAliasTypeDefinition.class)
public interface AliasTypeDefinition {

    String name();

    TypeReference aliasType();

    static ImmutableAliasTypeDefinition builder() {
        ImmutableAliasTypeDefinition.builder();
    }
}
