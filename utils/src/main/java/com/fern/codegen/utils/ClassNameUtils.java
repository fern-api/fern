package com.fern.codegen.utils;

import com.fern.types.types.FernFilepath;
import com.fern.types.types.NamedType;
import com.fern.types.types.TypeReference;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.TypeName;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.apache.commons.lang3.StringUtils;

public final class ClassNameUtils {

    public static final ClassName STRING_CLASS_NAME = ClassName.get(String.class);
    public static final ClassName OPTIONAL_CLASS_NAME = ClassName.get(Optional.class);
    public static final ClassName EXCEPTION_CLASS_NAME = ClassName.get(Exception.class);

    private final List<String> packagePrefixes;
    private final TypeReferenceUtils typeReferenceUtils;

    public ClassNameUtils(Optional<String> maybePackagePrefix) {
        String[] splitPackagePrefix = maybePackagePrefix
                .map(packagePrefix -> packagePrefix.split("/"))
                .orElseGet(() -> new String[0]);
        this.packagePrefixes = Arrays.asList(splitPackagePrefix);
        this.typeReferenceUtils = new TypeReferenceUtils(this);
    }

    public ClassName getClassNameForNamedType(NamedType namedType, PackageType packageType) {
        return getClassName(namedType.name(), Optional.of(packageType), Optional.of(namedType.fernFilepath()));
    }

    public ClassName getClassNameForNamedType(
            NamedType namedType, PackageType packageType, Optional<String> maybeSuffix) {
        String fullName = maybeSuffix
                .map(suffix -> namedType.name() + StringUtils.capitalize(suffix))
                .orElse(namedType.name());
        return getClassName(fullName, Optional.of(packageType), Optional.of(namedType.fernFilepath()));
    }

    public ClassName getNestedClassName(ClassName outerClassName, String nestedClassName) {
        String compatibleNestedClassName = getCompatibleClassName(nestedClassName);
        return outerClassName.nestedClass(compatibleNestedClassName);
    }

    public ClassName getClassName(
            String className, Optional<PackageType> generatedClassType, Optional<FernFilepath> fernFilepath) {
        String compatibleClassname = getCompatibleClassName(className);
        String packageName = getPackage(generatedClassType, fernFilepath);
        return ClassName.get(packageName, compatibleClassname);
    }

    public TypeName getTypeNameFromTypeReference(boolean primitiveAllowed, TypeReference typeReference) {
        return typeReferenceUtils.convertToTypeName(primitiveAllowed, typeReference);
    }

    @SuppressWarnings("RightCurly")
    private static String getCompatibleClassName(String name) {
        StringBuilder camelCaseNameBuilder = new StringBuilder();
        boolean shouldCapitalize = false;
        for (int i = 0; i < name.length(); ++i) {
            if (i == 0) {
                camelCaseNameBuilder.append(Character.toUpperCase(name.charAt(i)));
            }
            // else if (name.charAt(i) == '_') {
            //     camelCaseNameBuilder.append(Character.toUpperCase(name.charAt(i)));
            //     shouldCapitalize = true;
            // }
            else {
                if (shouldCapitalize) {
                    camelCaseNameBuilder.append(Character.toUpperCase(name.charAt(i)));
                } else {
                    camelCaseNameBuilder.append(name.charAt(i));
                }
                shouldCapitalize = false;
            }
        }
        String camelCasedClassName = camelCaseNameBuilder.toString();
        return KeyWordUtils.getKeyWordCompatibleName(camelCasedClassName);
    }

    private String getPackage(Optional<PackageType> generatedClassType, Optional<FernFilepath> filepath) {
        List<String> packageParts = new ArrayList<>(packagePrefixes);
        generatedClassType.map(ClassNameUtils::getGeneratedClassPackageName).ifPresent(packageParts::add);
        filepath.ifPresent(fernFilepath ->
                packageParts.addAll(Arrays.asList(fernFilepath.value().split("/"))));
        return String.join(".", packageParts);
    }

    private static String getGeneratedClassPackageName(PackageType packageType) {
        switch (packageType) {
            case TYPES:
                return "types";
            case INTERFACES:
                return "interfaces";
            case SERVER:
                return "server";
            case CLIENT:
                return "client";
            case SERVICES:
                return "services";
            case ERRORS:
                return "errors";
        }
        throw new IllegalStateException("Encountered unknown PackageType: " + packageType);
    }

    public enum PackageType {
        INTERFACES,
        TYPES,
        SERVER,
        CLIENT,
        SERVICES,
        ERRORS,
    }
}
