/*
 * (c) Copyright 2022 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.fern.codegen.utils;

import com.fern.interfaces.IStringWithAllCasings;
import com.fern.types.DeclaredErrorName;
import com.fern.types.DeclaredTypeName;
import com.fern.types.FernFilepath;
import com.fern.types.TypeReference;
import com.fern.types.services.DeclaredServiceName;
import com.fern.types.services.HttpEndpointId;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.TypeName;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;

public final class ClassNameUtils {
    private final List<String> packagePrefixes;
    private final TypeReferenceUtils typeReferenceUtils;

    public ClassNameUtils(String maybePackagePrefix) {
        String[] splitPackagePrefix = maybePackagePrefix.split("/");
        this.packagePrefixes = Arrays.asList(splitPackagePrefix);
        this.typeReferenceUtils = new TypeReferenceUtils(this);
    }

    public ClassName getClassNameFromEndpointId(
            DeclaredServiceName serviceName, HttpEndpointId endpointId, PackageType packageType) {
        return getClassName(endpointId.value(), Optional.empty(), Optional.of(serviceName.fernFilepath()), packageType);
    }

    public ClassName getClassNameFromServiceName(
            DeclaredServiceName serviceName, String suffix, PackageType packageType) {
        return getClassName(
                serviceName.name(), Optional.of(suffix), Optional.of(serviceName.fernFilepath()), packageType);
    }

    public ClassName getClassNameFromServiceName(DeclaredServiceName serviceName, PackageType packageType) {
        return getClassName(serviceName.name(), Optional.empty(), Optional.of(serviceName.fernFilepath()), packageType);
    }

    public ClassName getClassNameFromDeclaredTypeName(DeclaredTypeName declaredTypeName, PackageType packageType) {
        return getClassName(
                declaredTypeName.name(), Optional.empty(), Optional.of(declaredTypeName.fernFilepath()), packageType);
    }

    public ClassName getClassNameFromErrorName(DeclaredErrorName errorName, PackageType packageType) {
        return getClassName(errorName.name(), Optional.empty(), Optional.of(errorName.fernFilepath()), packageType);
    }

    public ClassName getClassNameFromErrorName(DeclaredErrorName errorName, String suffix, PackageType packageType) {
        return getClassName(errorName.name(), Optional.of(suffix), Optional.of(errorName.fernFilepath()), packageType);
    }

    public ClassName getNestedClassName(ClassName outerClassName, String nestedClassName) {
        String compatibleNestedClassName = getCompatibleClassName(nestedClassName);
        return outerClassName.nestedClass(compatibleNestedClassName);
    }

    public ClassName getClassName(
            String className,
            Optional<String> maybeSuffix,
            Optional<FernFilepath> fernFilepath,
            PackageType packageType) {
        String fullClassName = maybeSuffix
                .map(suffix -> className + StringUtils.capitalize(suffix))
                .orElse(className);
        String compatibleClassname = getCompatibleClassName(fullClassName);
        String packageName = getPackage(fernFilepath, packageType);
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

    private String getPackage(Optional<FernFilepath> filepath, PackageType packageType) {
        List<String> packageParts = new ArrayList<>(packagePrefixes);
        packageParts.add(getPackageFromType(packageType));
        filepath.ifPresent(fernFilepath -> packageParts.addAll(fernFilepath.value().stream()
                .map(IStringWithAllCasings::snakeCase)
                .map(snakeCase -> snakeCase.replaceAll("_", "."))
                .collect(Collectors.toList())));
        return String.join(".", packageParts);
    }

    private static String getPackageFromType(PackageType packageType) {
        switch (packageType) {
            case SERVER:
                return "server";
            case CLIENT:
                return "client";
            case MODEL:
            default:
                return "model";
        }
    }

    public enum PackageType {
        SERVER,
        CLIENT,
        MODEL
    }
}
