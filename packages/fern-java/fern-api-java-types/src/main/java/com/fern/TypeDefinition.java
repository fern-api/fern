package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableTypeDefinition.class)
@JsonIgnoreProperties({"type"})
public interface TypeDefinition extends IWithDocs {

    NamedType name();

    Type shape();

    static ImmutableTypeDefinition.NameBuildStage builder() {
        return ImmutableTypeDefinition.builder();
    }
}
