package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableObjectTypeDefinition.class)
@JsonIgnoreProperties({"type"})
public interface ObjectTypeDefinition {

    @JsonProperty("extends")
    List<TypeName> _extends();

    List<ObjectField> fields();

    static ImmutableObjectTypeDefinition.Builder builder() {
        return ImmutableObjectTypeDefinition.builder();
    }
}
