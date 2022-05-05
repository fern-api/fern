package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedErrorDecoder extends GeneratedFile {

    static ImmutableGeneratedErrorDecoder.FileBuildStage builder() {
        return ImmutableGeneratedErrorDecoder.builder();
    }
}
