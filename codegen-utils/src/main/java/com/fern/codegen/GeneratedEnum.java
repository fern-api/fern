package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.fern.types.types.EnumTypeDeclaration;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedEnum extends IGeneratedFile {

    EnumTypeDeclaration enumTypeDeclaration();

    static ImmutableGeneratedEnum.FileBuildStage builder() {
        return ImmutableGeneratedEnum.builder();
    }
}
