package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableUnionTypeDefinition.class)
@JsonIgnoreProperties({"type"})
public interface UnionTypeDefinition {

    List<SingleUnionType> types();

    static ImmutableUnionTypeDefinition.Builder builder() {
        return ImmutableUnionTypeDefinition.builder();
    }
}
