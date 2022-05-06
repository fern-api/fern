package com.fern.jersey;

import com.fern.codegen.GeneratedWireMessage;
import com.fern.immutables.StagedBuilderStyle;
import com.squareup.javapoet.TypeName;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface WireMessageGeneratorResult {

    TypeName typeName();

    Optional<GeneratedWireMessage> generatedWireMessage();

    static ImmutableWireMessageGeneratorResult.TypeNameBuildStage builder() {
        return ImmutableWireMessageGeneratorResult.builder();
    }
}
