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

import com.fern.ir.model.commons.FernFilepath;
import com.fern.ir.model.commons.StringWithAllCasings;
import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.ir.model.services.commons.DeclaredServiceName;
import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpEndpointId;
import com.squareup.javapoet.ClassName;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;

public final class ClientClassNameUtils {

    private static final String EXCEPTION_SUFFIX_NAME = "Exception";

    private final List<String> packagePrefixTokens = new ArrayList<>();

    public ClientClassNameUtils(IntermediateRepresentation ir, String organization) {
        packagePrefixTokens.add("com");
        packagePrefixTokens.addAll(splitOnNonAlphaNumericChar(organization));
        packagePrefixTokens.addAll(splitOnNonAlphaNumericChar(ir.getApiName()));
    }

    public ClassName getClassName(ErrorDeclaration errorDeclaration) {
        String packageName = getErrorsPackageName(errorDeclaration.getName().getFernFilepath());
        return ClassName.get(packageName, errorDeclaration.getName().getName());
    }

    public ClassName getClassName(DeclaredServiceName declaredServiceName, HttpEndpointId endpointId) {
        String packageName = getEndpointsPackageName(declaredServiceName.getFernFilepath());
        return ClassName.get(packageName, StringUtils.capitalize(endpointId.get()));
    }

    public ClassName getExceptionClassName(DeclaredServiceName declaredServiceName, HttpEndpoint httpEndpoint) {
        String packageName = getExceptionsPackageName(declaredServiceName.getFernFilepath());
        return ClassName.get(packageName, httpEndpoint.getName().getPascalCase() + EXCEPTION_SUFFIX_NAME);
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

    private String getExceptionsPackageName(FernFilepath fernFilepath) {
        return getPackage(Optional.of(fernFilepath), Optional.of("exceptions"));
    }

    private String getPackage(Optional<FernFilepath> fernFilepath, Optional<String> suffix) {
        List<String> tokens = new ArrayList<>(packagePrefixTokens);
        tokens.add("client");
        fernFilepath.ifPresent(filepath -> tokens.addAll(filepath.get().stream()
                .map(StringWithAllCasings::getSnakeCase)
                .flatMap(snakeCase -> splitOnNonAlphaNumericChar(snakeCase).stream())
                .collect(Collectors.toList())));
        suffix.ifPresent(tokens::add);
        return String.join(".", tokens);
    }

    private static List<String> splitOnNonAlphaNumericChar(String value) {
        return Arrays.asList(value.split("[^a-zA-Z0-9]"));
    }
}
