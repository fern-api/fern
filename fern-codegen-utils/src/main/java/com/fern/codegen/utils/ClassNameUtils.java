package com.fern.codegen.utils;

import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.TypeName;
import com.types.FernFilepath;
import com.types.NamedType;
import com.types.TypeReference;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.apache.commons.lang3.StringUtils;

public final class ClassNameUtils {

    public static final ClassName STRING_CLASS_NAME = ClassName.get(String.class);
    public static final ClassName OPTIONAL_CLASS_NAME = ClassName.get(Optional.class);
    public static final ClassName SET_CLASS_NAME = ClassName.get(Set.class);

    private final Optional<String> maybePackagePrefix;
    private final List<String> packagePrefixes;
    private final TypeReferenceUtils typeReferenceUtils;

    public ClassNameUtils(Optional<String> maybePackagePrefix) {
        this.maybePackagePrefix = maybePackagePrefix;
        String[] splitPackagePrefix = maybePackagePrefix
                .map(packagePrefix -> packagePrefix.split("/"))
                .orElseGet(() -> new String[0]);
        this.packagePrefixes = Arrays.asList(splitPackagePrefix);
        this.typeReferenceUtils = new TypeReferenceUtils(this);
    }

    public ClassName getClassNameForNamedType(NamedType namedType) {
        return ClassName.get(getPackageFromFilepath(namedType.fernFilepath()), namedType.name());
    }

    public ClassName getClassName(String className) {
        if (maybePackagePrefix.isPresent()) {
            return ClassName.get(maybePackagePrefix.get(), className);
        }
        return ClassName.get("", className);
    }

    public TypeName getTypeNameFromTypeReference(boolean primitiveAllowed, TypeReference typeReference) {
        return typeReferenceUtils.convertToTypeName(primitiveAllowed, typeReference);
    }

    public static String getKeywordCompatibleClassName(String name) {
        return KeyWordUtils.getKeyWordCompatibleName(StringUtils.capitalize(name));
    }

    public String getPackageFromFilepath(FernFilepath filepath) {
        List<String> splitFilepath = Arrays.asList(filepath.value().split("/"));
        List<String> packagePath = new ArrayList<>(packagePrefixes);
        packagePath.addAll(splitFilepath);
        return String.join(".", packagePath);
    }
}
