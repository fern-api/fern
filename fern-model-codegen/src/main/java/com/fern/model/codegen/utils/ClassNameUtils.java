package com.fern.model.codegen.utils;

import com.fern.NamedTypeReference;
import com.squareup.javapoet.ClassName;
import java.util.Optional;

public class ClassNameUtils {

    public static final ClassName STRING_CLASS_NAME = ClassName.get(String.class);
    public static final ClassName OPTIONAL_CLASS_NAME = ClassName.get(Optional.class);

    private ClassNameUtils() {}

    public static ClassName getClassName(NamedTypeReference namedTypeReference) {
        return ClassName.get(
                FilepathUtils.convertFilepathToPackage(namedTypeReference.filepath()), namedTypeReference.name());
    }
}
