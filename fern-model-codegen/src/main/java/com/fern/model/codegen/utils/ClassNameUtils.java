package com.fern.model.codegen.utils;

import com.fern.NamedType;
import com.squareup.javapoet.ClassName;
import java.util.Optional;
import org.apache.commons.lang3.StringUtils;

public final class ClassNameUtils {

    public static final ClassName STRING_CLASS_NAME = ClassName.get(String.class);
    public static final ClassName OPTIONAL_CLASS_NAME = ClassName.get(Optional.class);

    private final FilepathUtils filepathUtils;
    private final KeyWordUtils keyWordUtils;

    public ClassNameUtils(FilepathUtils filepathUtils, KeyWordUtils keyWordUtils) {
        this.filepathUtils = filepathUtils;
        this.keyWordUtils = keyWordUtils;
    }

    public ClassName getClassName(NamedType namedType) {
        return ClassName.get(filepathUtils.convertFilepathToPackage(namedType.fernFilepath()), namedType.name());
    }

    public String getKeywordCompatibleClassName(String name) {
        return keyWordUtils.getKeyWordCompatibleName(StringUtils.capitalize(name));
    }
}
