package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableTypeDefinition.class)
public interface TypeDefinition extends IWithDocs {

    List<NamedTypeReference> _extends();

    NamedTypeReference name();

    Type shape();

    static ImmutableTypeDefinition.NameBuildStage builder() {
        return ImmutableTypeDefinition.builder();
    }
}
