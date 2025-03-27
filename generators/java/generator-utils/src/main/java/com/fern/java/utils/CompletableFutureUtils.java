package com.fern.java.utils;

import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.concurrent.CompletableFuture;

public final class CompletableFutureUtils {

    private CompletableFutureUtils() {}

    public static TypeName wrapInCompletableFuture(TypeName rawTypeName) {
        if (rawTypeName.equals(TypeName.VOID) || rawTypeName.isPrimitive()) {
            rawTypeName = rawTypeName.box();
        }

        return ParameterizedTypeName.get(ClassName.get(CompletableFuture.class), rawTypeName);
    }
}
