package com.fern.codegen.utils;

import com.fern.java.jackson.ClientObjectMappers;
import com.fern.types.errors.ErrorName;
import com.fern.types.services.commons.ServiceName;
import com.fern.types.types.DeclaredTypeName;
import com.fern.types.types.FernFilepath;
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

    public static final ClassName CLIENT_OBJECT_MAPPERS_CLASS_NAME = ClassName.get(ClientObjectMappers.class);
    public static final String CLIENT_OBJECT_MAPPERS_JSON_MAPPER_FIELD_NAME;

    static {
        try {
            CLIENT_OBJECT_MAPPERS_JSON_MAPPER_FIELD_NAME =
                    ClientObjectMappers.class.getField("JSON_MAPPER").getName();
        } catch (NoSuchFieldException e) {
            throw new RuntimeException(e);
        }
    }

    private final List<String> packagePrefixes;
    private final TypeReferenceUtils typeReferenceUtils;

    public ClassNameUtils(Optional<String> maybePackagePrefix) {
        String[] splitPackagePrefix = maybePackagePrefix
                .map(packagePrefix -> packagePrefix.split("/"))
                .orElseGet(() -> new String[0]);
        this.packagePrefixes = Arrays.asList(splitPackagePrefix);
        this.typeReferenceUtils = new TypeReferenceUtils(this);
    }

    public ClassName getClassNameFromServiceName(ServiceName serviceName, PackageType packageType, String suffix) {
        return getClassName(
                serviceName.name(),
                Optional.of(suffix),
                Optional.of(packageType),
                Optional.of(serviceName.fernFilepath()));
    }

    public ClassName getClassNameFromServiceName(ServiceName serviceName, PackageType packageType) {
        return getClassName(
                serviceName.name(),
                Optional.empty(),
                Optional.of(packageType),
                Optional.of(serviceName.fernFilepath()));
    }

    public ClassName getClassNameFromDeclaredTypeName(DeclaredTypeName declaredTypeName, PackageType packageType) {
        return getClassName(
                declaredTypeName.name(),
                Optional.empty(),
                Optional.of(packageType),
                Optional.of(declaredTypeName.fernFilepath()));
    }

    public ClassName getClassNameFromErrorName(ErrorName errorName, PackageType packageType) {
        return getClassName(
                errorName.name(), Optional.empty(), Optional.of(packageType), Optional.of(errorName.fernFilepath()));
    }

    public ClassName getNestedClassName(ClassName outerClassName, String nestedClassName) {
        String compatibleNestedClassName = getCompatibleClassName(nestedClassName);
        return outerClassName.nestedClass(compatibleNestedClassName);
    }

    public ClassName getClassName(
            String className,
            Optional<String> maybeSuffix,
            Optional<PackageType> generatedClassType,
            Optional<FernFilepath> fernFilepath) {
        String fullClassName = maybeSuffix
                .map(suffix -> className + StringUtils.capitalize(suffix))
                .orElse(className);
        String compatibleClassname = getCompatibleClassName(fullClassName);
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
        filepath.ifPresent(fernFilepath -> packageParts.addAll(fernFilepath.value()));
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
