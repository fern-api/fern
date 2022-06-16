package com.fern.codegen.payload;

import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface VoidPayload extends Payload {

    VoidPayload INSTANCE = builder().build();

    static ImmutableVoidPayload.Builder builder() {
        return ImmutableVoidPayload.builder();
    }
}
