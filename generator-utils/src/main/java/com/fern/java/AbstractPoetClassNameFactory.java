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

package com.fern.java;

import com.fern.ir.model.commons.FernFilepath;
import com.fern.ir.model.commons.StringWithAllCasings;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.ir.model.types.DeclaredTypeName;
import com.squareup.javapoet.ClassName;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public abstract class AbstractPoetClassNameFactory {

    private final List<String> packagePrefixTokens = new ArrayList<>();

    public AbstractPoetClassNameFactory(IntermediateRepresentation ir, String organization) {
        packagePrefixTokens.add("com");
        packagePrefixTokens.addAll(splitOnNonAlphaNumericChar(organization));
        packagePrefixTokens.addAll(splitOnNonAlphaNumericChar(ir.getApiName()));
    }

    public abstract String rootPackageName();

    public final ClassName getTypeClassName(DeclaredTypeName declaredTypeName) {
        String packageName = getTypesPackageName(declaredTypeName.getFernFilepath());
        return ClassName.get(packageName, declaredTypeName.getName());
    }

    public final ClassName getInterfaceClassName(DeclaredTypeName declaredTypeName) {
        String packageName = getTypesPackageName(declaredTypeName.getFernFilepath());
        return ClassName.get(packageName, "I" + declaredTypeName.getName());
    }

    public final ClassName getTopLevelClassName(String className) {
        String packageName = getPackage(Optional.empty(), Optional.empty());
        return ClassName.get(packageName, className);
    }

    public final ClassName getCoreClassName(String className) {
        List<String> tokens = new ArrayList<>(packagePrefixTokens);
        tokens.add("core");
        return ClassName.get(String.join(".", tokens), className);
    }

    protected final String getTypesPackageName(FernFilepath fernFilepath) {
        return getPackage(Optional.of(fernFilepath), getTypesPrefix());
    }

    protected abstract Optional<String> getTypesPrefix();

    protected final String getEndpointsPackageName(FernFilepath fernFilepath) {
        return getPackage(Optional.of(fernFilepath), Optional.of("endpoints"));
    }

    protected final String getErrorsPackageName(FernFilepath fernFilepath) {
        return getPackage(Optional.of(fernFilepath), Optional.of("errors"));
    }

    protected final String getExceptionsPackageName(FernFilepath fernFilepath) {
        return getPackage(Optional.of(fernFilepath), Optional.of("exceptions"));
    }

    protected final String getPackage(Optional<FernFilepath> fernFilepath, Optional<String> suffix) {
        List<String> tokens = new ArrayList<>(packagePrefixTokens);
        tokens.add(rootPackageName());
        fernFilepath.ifPresent(filepath -> tokens.addAll(filepath.get().stream()
                .map(StringWithAllCasings::getSnakeCase)
                .flatMap(snakeCase -> splitOnNonAlphaNumericChar(snakeCase).stream())
                .collect(Collectors.toList())));
        suffix.ifPresent(tokens::add);
        return String.join(".", tokens);
    }

    protected static List<String> splitOnNonAlphaNumericChar(String value) {
        return Arrays.asList(value.split("[^a-zA-Z0-9]"));
    }
}
