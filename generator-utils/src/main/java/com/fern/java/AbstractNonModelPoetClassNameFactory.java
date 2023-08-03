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

import com.fern.irV20.model.commons.FernFilepath;
import com.fern.irV20.model.commons.Name;
import com.fern.irV20.model.commons.SafeAndUnsafeString;
import com.fern.irV20.model.types.DeclaredTypeName;
import com.squareup.javapoet.ClassName;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public abstract class AbstractNonModelPoetClassNameFactory extends AbstractPoetClassNameFactory {

    private static final Pattern STARTS_WITH_NUMBER = Pattern.compile("^\\d");

    public AbstractNonModelPoetClassNameFactory(List<String> packagePrefixTokens) {
        super(packagePrefixTokens);
    }

    @Override
    public final ClassName getTypeClassName(DeclaredTypeName declaredTypeName) {
        String packageName = getTypesPackageName(declaredTypeName.getFernFilepath());
        return ClassName.get(
                packageName, declaredTypeName.getName().getPascalCase().getSafeName());
    }

    @Override
    public final ClassName getInterfaceClassName(DeclaredTypeName declaredTypeName) {
        String packageName = getTypesPackageName(declaredTypeName.getFernFilepath());
        return ClassName.get(
                packageName, "I" + declaredTypeName.getName().getPascalCase().getSafeName());
    }

    protected final String getTypesPackageName(FernFilepath fernFilepath) {
        return getResourcesPackage(Optional.of(fernFilepath), Optional.of("types"));
    }

    protected final String getErrorsPackageName(FernFilepath fernFilepath) {
        return getResourcesPackage(Optional.of(fernFilepath), Optional.of("errors"));
    }

    protected final String getResourcesPackage(Optional<FernFilepath> fernFilepath, Optional<String> suffix) {
        List<String> tokens = new ArrayList<>(getPackagePrefixTokens());
        if (fernFilepath.isPresent() && !fernFilepath.get().getAllParts().isEmpty()) {
            tokens.add("resources");
        }
        fernFilepath.ifPresent(filepath -> tokens.addAll(filepath.getAllParts().stream()
                .map(Name::getCamelCase)
                .map(SafeAndUnsafeString::getSafeName)
                // names should be lower case
                .map(String::toLowerCase)
                .collect(Collectors.toList())));
        suffix.ifPresent(tokens::add);
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
