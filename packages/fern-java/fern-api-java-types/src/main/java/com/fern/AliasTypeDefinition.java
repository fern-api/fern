package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableAliasTypeDefinition.class)
@JsonIgnoreProperties({"type"})
public interface AliasTypeDefinition {

    TypeReference aliasOf();

    boolean isId();

    static ImmutableAliasTypeDefinition.AliasOfBuildStage builder() {
        return ImmutableAliasTypeDefinition.builder();
    }
}
