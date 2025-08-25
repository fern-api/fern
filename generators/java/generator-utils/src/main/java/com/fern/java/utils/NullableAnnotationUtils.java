package com.fern.java.utils;

import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.TypeReference;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;

public final class NullableAnnotationUtils {
    
    private static final ClassName NULLABLE = ClassName.get("org.jetbrains.annotations", "Nullable");
    
    private NullableAnnotationUtils() {
        // Utility class
    }
    
    /**
     * Checks if a TypeReference is nullable<T>
     */
    public static boolean isNullableType(TypeReference typeReference) {
        return typeReference.getContainer()
                .map(ContainerType::isNullable)
                .orElse(false);
    }
    
    /**
     * Gets the @Nullable annotation spec
     */
    public static AnnotationSpec getNullableAnnotation() {
        return AnnotationSpec.builder(NULLABLE).build();
    }
    
    /**
     * Checks if we should add @Nullable annotation based on type and config
     */
    public static boolean shouldAddNullableAnnotation(TypeReference typeReference, boolean useNullableAnnotation) {
        return useNullableAnnotation && isNullableType(typeReference);
    }
}