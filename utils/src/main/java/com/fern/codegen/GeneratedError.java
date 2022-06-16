package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.fern.types.errors.ErrorDefinition;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedError extends IGeneratedFile {

    ErrorDefinition errorDefinition();

    static ImmutableGeneratedError.FileBuildStage builder() {
        return ImmutableGeneratedError.builder();
    }
}
