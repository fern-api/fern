package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableEnumTypeDefinition.class)
@JsonIgnoreProperties({"type"})
public interface EnumTypeDefinition {

    List<EnumValue> values();

    static ImmutableEnumTypeDefinition.Builder builder() {
        return ImmutableEnumTypeDefinition.builder();
    }
}
