package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableIntermediateRepresentation.class)
@JsonIgnoreProperties({"type"})
public interface IntermediateRepresentation {

    List<TypeDefinition> types();

    Services services();

    static ImmutableIntermediateRepresentation.ServicesBuildStage builder() {
        return ImmutableIntermediateRepresentation.builder();
    }

}
