/*
 * (c) Copyright 2023 Birch Solutions Inc. All rights reserved.
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

package com.fern.java;

import com.fern.ir.model.commons.FernFilepath;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.SafeAndUnsafeString;
import com.fern.ir.model.types.DeclaredTypeName;
import com.squareup.javapoet.ClassName;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public abstract class AbstractNonModelPoetClassNameFactory extends AbstractPoetClassNameFactory {

    private static final Pattern STARTS_WITH_NUMBER = Pattern.compile("^\\d");

    public AbstractNonModelPoetClassNameFactory(List<String> packagePrefixTokens) {
        super(packagePrefixTokens);
    }

    @Override
    public final ClassName getTypeClassName(DeclaredTypeName declaredTypeName) {
        String packageName =
                getPackageForFernfilepath(declaredTypeName.getFernFilepath().getAllParts());
        return ClassName.get(
                packageName, declaredTypeName.getName().getPascalCase().getSafeName());
    }

    @Override
    public final ClassName getInterfaceClassName(DeclaredTypeName declaredTypeName) {
        String packageName = getRootPackage();
        return ClassName.get(
                packageName, "I" + declaredTypeName.getName().getPascalCase().getSafeName());
    }

    protected final String getTypesPackageName(FernFilepath fernFilepath) {
        return getPackageForFernfilepath(fernFilepath.getAllParts());
    }

    protected final String getErrorsPackageName(FernFilepath fernFilepath) {
        return getPackageForFernfilepath(fernFilepath.getAllParts());
    }

    protected final String getPackageForFernfilepath() {
        return this.getPackageForFernfilepath(Collections.emptyList());
    }

    protected final String getPackageForFernfilepath(List<Name> packageParts) {
        List<String> tokens = new ArrayList<>(getPackagePrefixTokens());
        tokens.addAll(packageParts.stream()
                .map(Name::getCamelCase)
                .map(SafeAndUnsafeString::getSafeName)
                // names should be lowercase
                .map(String::toLowerCase)
                .collect(Collectors.toList()));
        List<String> sanitizedTokens = new ArrayList<>();
        for (String token : tokens) {
            if (startsWithNumber(token)) {
                sanitizedTokens.add("_" + token);
            } else {
                sanitizedTokens.add(token);
            }
        }
        return String.join(".", sanitizedTokens);
    }

    private static boolean startsWithNumber(String str) {
        return STARTS_WITH_NUMBER.matcher(str).find();
    }
}
