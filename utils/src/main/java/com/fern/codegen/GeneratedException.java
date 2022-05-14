package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.fern.types.errors.ErrorDefinition;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedException extends IGeneratedFile {

    ErrorDefinition errorDefinition();

    static ImmutableGeneratedException.FileBuildStage builder() {
        return ImmutableGeneratedException.builder();
    }
}
