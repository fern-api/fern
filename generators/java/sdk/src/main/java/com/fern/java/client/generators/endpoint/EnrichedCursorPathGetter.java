package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.TypeName;
import java.util.Optional;
import org.immutables.value.Value;

// TODO(ajgateno): This will be necessary until the required IR changes include more information about the path
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
