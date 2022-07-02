package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.fern.types.UnionTypeDeclaration;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedUnion extends IGeneratedFile {

    UnionTypeDeclaration unionTypeDeclaration();

    static ImmutableGeneratedUnion.FileBuildStage builder() {
        return ImmutableGeneratedUnion.builder();
    }
}
