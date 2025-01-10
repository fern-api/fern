package com.fern.java.utils;

import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public interface NamedTypeId {
    String name();

    TypeId typeId();

    TypeReference sourceReference();

    static ImmutableNamedTypeId.NameBuildStage builder() {
        return ImmutableNamedTypeId.builder();
    }
}
