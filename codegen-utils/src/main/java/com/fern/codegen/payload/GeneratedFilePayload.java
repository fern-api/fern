package com.fern.codegen.payload;

import com.fern.codegen.GeneratedFile;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedFilePayload extends Payload {

    GeneratedFile generatedFile();

    static ImmutableGeneratedFilePayload.GeneratedFileBuildStage builder() {
        return ImmutableGeneratedFilePayload.builder();
    }
}
