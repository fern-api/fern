package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.CodeBlock;
import org.immutables.value.Value;

// TODO(ajgateno): This will be necessary until the required IR changes include more information about the path
@Value.Immutable
public interface EnrichedCursorPathSetter {

    EnrichedCursorPathGetter getter();

    CodeBlock setter();

    static ImmutableEnrichedCursorPathSetter.Builder builder() {
        return ImmutableEnrichedCursorPathSetter.builder();
    }
}
