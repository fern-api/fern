package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.fern.types.types.UnionTypeDefinition;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedUnion extends IGeneratedFile {

    UnionTypeDefinition unionTypeDefinition();

    static ImmutableGeneratedUnion.FileBuildStage builder() {
        return ImmutableGeneratedUnion.builder();
    }
}
