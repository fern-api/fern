package com.fern.model.codegen.utils;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;

import javax.lang.model.element.Modifier;
import java.util.Set;

public final class KeyWordUtils {

    private static final Set<String> RESERVED_WORDS = Set.of(
            "enum",
            "extends");

    private KeyWordUtils() {
    }

    public static MethodSpec getKeyWordCompatibleImmutablesPropertyName(String methodName, TypeName returnType) {
        MethodSpec.Builder methodBuilder;
        if (isReserved(methodName)) {
            methodBuilder = MethodSpec.methodBuilder("_" + methodName)
                    .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                            .addMember("value", methodName)
                            .build());

        } else {
            methodBuilder = MethodSpec.methodBuilder(methodName);
        }
        return methodBuilder
                .returns(returnType)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .build();
    }

    public static String getKeyWordCompatibleName(String name) {
        if (isReserved(name)) {
            return "_" + name;
        }
        return name;
    }

    private static boolean isReserved(String value) {
        return RESERVED_WORDS.contains(value.toLowerCase());
    }
}
