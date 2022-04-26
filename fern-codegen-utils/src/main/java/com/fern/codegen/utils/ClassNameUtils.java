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
import org.apache.commons.text.CaseUtils;

public final class ClassNameUtils {

    public static final ClassName STRING_CLASS_NAME = ClassName.get(String.class);
    public static final ClassName OPTIONAL_CLASS_NAME = ClassName.get(Optional.class);

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

    public ClassName getClassName(
            String className, Optional<PackageType> generatedClassType, Optional<FernFilepath> fernFilepath) {
        String compatibleClassname = getCompatibleClassName(className);
        String packageName = getPackage(generatedClassType, fernFilepath);
        return ClassName.get(packageName, compatibleClassname);
    }

    public TypeName getTypeNameFromTypeReference(boolean primitiveAllowed, TypeReference typeReference) {
        return typeReferenceUtils.convertToTypeName(primitiveAllowed, typeReference);
    }

    private static String getCompatibleClassName(String name) {
        String camelCasedClassName = CaseUtils.toCamelCase(name, true, ' ', '_');
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
            case SERVICES:
                return "services";
        }
        throw new IllegalStateException("Encountered unknown PackageType: " + packageType);
    }

    public enum PackageType {
        INTERFACES,
        TYPES,
        SERVICES,
    }
}
