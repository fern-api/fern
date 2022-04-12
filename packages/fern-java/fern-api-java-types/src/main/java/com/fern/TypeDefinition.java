package com.fern;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableTypeDefinition.class)
@JsonIgnoreProperties({"type"})
public interface TypeDefinition extends IWithDocs {

    @JsonProperty("extends")
    List<NamedTypeReference> _extends();

    NamedTypeReference name();

    Type shape();

    static ImmutableTypeDefinition.NameBuildStage builder() {
        return ImmutableTypeDefinition.builder();
    }
}
