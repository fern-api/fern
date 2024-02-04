package com.fern.java;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonCreator.Mode;
import com.squareup.javapoet.AnnotationSpec;

public final class FernJavaAnnotations {

    private FernJavaAnnotations() {}

    public static AnnotationSpec jacksonDelegatingCreator() {
        return AnnotationSpec.builder(JsonCreator.class)
                .addMember(
                        "mode",
                        "$T.$L.$L",
                        JsonCreator.class,
                        JsonCreator.Mode.class.getSimpleName(),
                        Mode.DELEGATING.name())
                .build();
    }

    public static AnnotationSpec jacksonPropertiesCreator() {
        return AnnotationSpec.builder(JsonCreator.class)
                .addMember(
                        "mode",
                        "$T.$L.$L",
                        JsonCreator.class,
                        JsonCreator.Mode.class.getSimpleName(),
                        Mode.PROPERTIES.name())
                .build();
    }
}
