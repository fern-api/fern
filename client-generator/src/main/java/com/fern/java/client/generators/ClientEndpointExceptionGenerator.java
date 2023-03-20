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

package com.fern.java.client.generators;

import com.fern.ir.v3.model.errors.DeclaredErrorName;
import com.fern.ir.v3.model.errors.ErrorDeclaration;
import com.fern.ir.v3.model.ir.FernConstants;
import com.fern.ir.v3.model.services.http.HttpEndpoint;
import com.fern.ir.v3.model.services.http.HttpService;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.generators.exception.ClientExceptionTypeSpecGenerator;
import com.fern.java.client.generators.exception.ClientExceptionUnionOtherSubType;
import com.fern.java.client.generators.exception.ClientExceptionUnionSubType;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.AbstractGeneratedJavaFile;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class ClientEndpointExceptionGenerator extends AbstractFileGenerator {

    private final HttpEndpoint httpEndpoint;
    private final Map<DeclaredErrorName, GeneratedJavaFile> generatedClientErrors;

    public ClientEndpointExceptionGenerator(
            ClientGeneratorContext clientGeneratorContext,
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            Map<DeclaredErrorName, GeneratedJavaFile> generatedClientErrors) {
        super(
                clientGeneratorContext
                        .getPoetClassNameFactory()
                        .getEndpointExceptionClassName(httpService.getName(), httpEndpoint),
                clientGeneratorContext);
        this.httpEndpoint = httpEndpoint;
        this.generatedClientErrors = generatedClientErrors;
    }

    @Override
    public AbstractGeneratedJavaFile generateFile() {
        FernConstants fernConstants = generatorContext.getIr().getConstants();
        List<ClientExceptionUnionSubType> clientExceptionSubTypes = httpEndpoint.getErrors().get().stream()
                .map(responseError -> {
                    ErrorDeclaration errorDeclaration =
                            generatorContext.getErrorDefinitionsByName().get(responseError.getError());
                    AbstractGeneratedJavaFile generatedClientError =
                            generatedClientErrors.get(responseError.getError());
                    return new ClientExceptionUnionSubType(
                            className, errorDeclaration, generatedClientError, fernConstants);
                })
                .collect(Collectors.toList());
        ClientExceptionUnionOtherSubType clientExceptionOtherSubType = new ClientExceptionUnionOtherSubType(className);
        ClientExceptionTypeSpecGenerator clientExceptionGenerator = new ClientExceptionTypeSpecGenerator(
                className, clientExceptionSubTypes, clientExceptionOtherSubType, fernConstants);
        TypeSpec exceptionTypeSpec = clientExceptionGenerator.generateUnionTypeSpec();
        JavaFile exceptionFile =
                JavaFile.builder(className.packageName(), exceptionTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(exceptionFile)
                .build();
    }
}
