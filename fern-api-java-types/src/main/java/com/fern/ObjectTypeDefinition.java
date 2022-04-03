package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableObjectTypeDefinition.class)
public interface ObjectTypeDefinition {

    List<ObjectField> fields();

    static ImmutableObjectTypeDefinition.Builder builder() {
        return ImmutableObjectTypeDefinition.builder();
    }
}
