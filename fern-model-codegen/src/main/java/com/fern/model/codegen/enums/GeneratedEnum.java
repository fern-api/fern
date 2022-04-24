package com.fern.model.codegen.enums;

import com.fern.codegen.GeneratedFile;
import com.fern.immutables.StagedBuilderStyle;
import com.types.EnumTypeDefinition;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedEnum extends GeneratedFile {

    EnumTypeDefinition enumTypeDefinition();

    static ImmutableGeneratedEnum.FileBuildStage builder() {
        return ImmutableGeneratedEnum.builder();
    }
}
