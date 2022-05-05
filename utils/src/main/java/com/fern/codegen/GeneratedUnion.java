package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.types.UnionTypeDefinition;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedUnion extends GeneratedFile {

    UnionTypeDefinition unionTypeDefinition();

    static ImmutableGeneratedUnion.FileBuildStage builder() {
        return ImmutableGeneratedUnion.builder();
    }
}
