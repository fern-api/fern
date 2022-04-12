package com.fern.model.codegen.utils;

import com.fern.NamedTypeReference;
import com.squareup.javapoet.ClassName;

public class ClassNameUtils {

    private static final String IMMUTABLE_PREFIX = "Immutable";

    private ClassNameUtils() {
    }

    public static ClassName getClassName(NamedTypeReference namedTypeReference) {
        return ClassName.get(
                FilepathUtils.convertFilepathToPackage(namedTypeReference.filepath()),
                namedTypeReference.name());
    }

    public static ClassName getImmutablesClassName(NamedTypeReference namedTypeReference) {
        return ClassName.get(
                FilepathUtils.convertFilepathToPackage(namedTypeReference.filepath()),
                IMMUTABLE_PREFIX + namedTypeReference.name());
    }
}
