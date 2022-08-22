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

package com.fern.jersey.client;

import com.fern.interfaces.IStringWithAllCasings;
import com.fern.types.ErrorDeclaration;
import com.fern.types.FernFilepath;
import com.fern.types.IntermediateRepresentation;
import com.fern.types.services.DeclaredServiceName;
import com.fern.types.services.HttpEndpointId;
import com.squareup.javapoet.ClassName;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;

public final class ClientClassNameUtils {

    private final List<String> packagePrefixTokens = new ArrayList<>();

    public ClientClassNameUtils(IntermediateRepresentation ir, String organization) {
        packagePrefixTokens.add("com");
        packagePrefixTokens.addAll(splitOnNonAlphaNumericChar(organization));
        packagePrefixTokens.addAll(splitOnNonAlphaNumericChar(ir.apiName()));
    }

    public ClassName getClassName(ErrorDeclaration errorDeclaration) {
        String packageName = getErrorsPackageName(errorDeclaration.name().fernFilepath());
        return ClassName.get(packageName, errorDeclaration.name().name());
    }

    public ClassName getClassName(DeclaredServiceName declaredServiceName, HttpEndpointId endpointId) {
        String packageName = getEndpointsPackageName(declaredServiceName.fernFilepath());
        return ClassName.get(packageName, StringUtils.capitalize(endpointId.value()));
    }

    private String getPackageName() {
        return getPackage(Optional.empty(), Optional.empty());
    }

    private String getPackageName(FernFilepath fernFilepath) {
        return getPackage(Optional.of(fernFilepath), Optional.empty());
    }

    private String getEndpointsPackageName(FernFilepath fernFilepath) {
        return getPackage(Optional.of(fernFilepath), Optional.of("endpoints"));
    }

    private String getTypesPackageName(FernFilepath fernFilepath) {
        return getPackage(Optional.of(fernFilepath), Optional.of("types"));
    }

    private String getErrorsPackageName(FernFilepath fernFilepath) {
        return getPackage(Optional.of(fernFilepath), Optional.of("errors"));
    }

    private String getPackage(Optional<FernFilepath> fernFilepath, Optional<String> suffix) {
        List<String> tokens = new ArrayList<>(packagePrefixTokens);
        tokens.add("client");
        fernFilepath.ifPresent(filepath -> tokens.addAll(filepath.value().stream()
                .map(IStringWithAllCasings::snakeCase)
                .flatMap(snakeCase -> splitOnNonAlphaNumericChar(snakeCase).stream())
                .collect(Collectors.toList())));
        suffix.ifPresent(tokens::add);
        return String.join(".", tokens);
    }

    private static List<String> splitOnNonAlphaNumericChar(String value) {
        return Arrays.asList(value.split("[^a-zA-Z0-9]"));
    }
}
