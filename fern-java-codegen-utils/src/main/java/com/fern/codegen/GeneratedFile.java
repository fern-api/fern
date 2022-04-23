package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedFile extends IGeneratedFile {

    static ImmutableGeneratedFile.FileBuildStage builder() {
        return ImmutableGeneratedFile.builder();
    }
}
