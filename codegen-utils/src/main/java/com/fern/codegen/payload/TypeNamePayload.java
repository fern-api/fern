package com.fern.codegen.payload;

import com.fern.immutables.StagedBuilderStyle;
import com.squareup.javapoet.TypeName;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface TypeNamePayload extends Payload {

    TypeName typeName();

    static ImmutableTypeNamePayload.TypeNameBuildStage builder() {
        return ImmutableTypeNamePayload.builder();
    }
}
