package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.TypeName;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
public interface EnrichedCursorPathGetter {

    EnrichedCursorPathItem pathItem();

    CodeBlock getter();

    TypeName typeName();

    Optional<EnrichedCursorPathGetter> previous();

    @Value.Default
    default boolean optional() {
        return false;
    }

    default String propertyName() {
        return pathItem().name().getCamelCase().getSafeName();
    }

    static ImmutableEnrichedCursorPathGetter.Builder builder() {
        return ImmutableEnrichedCursorPathGetter.builder();
    }
}
