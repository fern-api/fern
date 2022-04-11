package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableObjectTypeDefinition.class)
public interface ObjectTypeDefinition {

    List<ObjectField> fields();

    static ImmutableObjectTypeDefinition.Builder builder() {
        return ImmutableObjectTypeDefinition.builder();
    }
}
