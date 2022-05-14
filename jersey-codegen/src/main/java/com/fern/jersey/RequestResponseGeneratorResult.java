package com.fern.jersey;

import com.fern.codegen.IGeneratedFile;
import com.fern.immutables.StagedBuilderStyle;
import com.squareup.javapoet.TypeName;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface RequestResponseGeneratorResult {

    TypeName typeName();

    Optional<IGeneratedFile> generatedFile();

    static ImmutableRequestResponseGeneratorResult.TypeNameBuildStage builder() {
        return ImmutableRequestResponseGeneratorResult.builder();
    }
}
