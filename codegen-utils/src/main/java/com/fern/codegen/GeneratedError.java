package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.fern.types.errors.ErrorDeclaration;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedError extends IGeneratedFile {

    ErrorDeclaration errorDeclaration();

    static ImmutableGeneratedError.FileBuildStage builder() {
        return ImmutableGeneratedError.builder();
    }
}
