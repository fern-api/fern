package com.fern.java.utils;

import com.fern.ir.model.commons.TypeId;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public interface NamedTypeId {
    String name();

    TypeId typeId();

    static ImmutableNamedTypeId.NameBuildStage builder() {
        return ImmutableNamedTypeId.builder();
    }
}
