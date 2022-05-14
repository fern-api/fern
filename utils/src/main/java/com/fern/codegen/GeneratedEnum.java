package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.fern.types.types.EnumTypeDefinition;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedEnum extends IGeneratedFile {

    EnumTypeDefinition enumTypeDefinition();

    static ImmutableGeneratedEnum.FileBuildStage builder() {
        return ImmutableGeneratedEnum.builder();
    }
}
