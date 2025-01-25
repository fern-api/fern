package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.CodeBlock;
import org.immutables.value.Value;

@Value.Immutable
public interface EnrichedCursorPathSetter {

    EnrichedCursorPathGetter getter();

    CodeBlock setter();

    static ImmutableEnrichedCursorPathSetter.Builder builder() {
        return ImmutableEnrichedCursorPathSetter.builder();
    }
}
