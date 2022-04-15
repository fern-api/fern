package com.fern.model.codegen.utils;

import com.fern.NamedType;
import com.squareup.javapoet.ClassName;
import java.util.Optional;

public final class ClassNameUtils {

    public static final ClassName STRING_CLASS_NAME = ClassName.get(String.class);
    public static final ClassName OPTIONAL_CLASS_NAME = ClassName.get(Optional.class);

    private final FilepathUtils filepathUtils;

    public ClassNameUtils(FilepathUtils filepathUtils) {
        this.filepathUtils = filepathUtils;
    }

    public ClassName getClassName(NamedType namedType) {
        return ClassName.get(filepathUtils.convertFilepathToPackage(namedType.fernFilepath()), namedType.name());
    }
}
