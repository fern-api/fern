package com.fern.model.codegen.union;

import com.fern.UnionTypeDefinition;
import com.fern.codegen.GeneratedFile;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedUnion extends GeneratedFile<UnionTypeDefinition> {

    static ImmutableGeneratedUnion.FileBuildStage builder() {
        return ImmutableGeneratedUnion.builder();
    }
}
