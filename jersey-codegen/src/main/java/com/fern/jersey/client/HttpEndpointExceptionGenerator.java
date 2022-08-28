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

import com.fern.codegen.GeneratedFile;
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.generator.union.client.ClientErrorUnionGenerator;
import com.fern.codegen.generator.union.client.ClientErrorUnionOtherSubType;
import com.fern.codegen.generator.union.client.ClientErrorUnionSubType;
import com.fern.ir.model.errors.DeclaredErrorName;
import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpService;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class HttpEndpointExceptionGenerator extends Generator {

    private final HttpEndpoint httpEndpoint;

    private final ClassName exceptionClassName;
    private final Map<DeclaredErrorName, IGeneratedFile> generatedClientErrors;

    public HttpEndpointExceptionGenerator(
            GeneratorContext generatorContext,
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            Map<DeclaredErrorName, IGeneratedFile> generatedClientErrors) {
        super(generatorContext);
        ClientClassNameUtils clientClassNameUtils =
                new ClientClassNameUtils(generatorContext.getIr(), generatorContext.getOrganization());
        this.httpEndpoint = httpEndpoint;
        this.generatedClientErrors = generatedClientErrors;
        this.exceptionClassName = clientClassNameUtils.getExceptionClassName(httpService.getName(), httpEndpoint);
    }

    @Override
    public IGeneratedFile generate() {
        List<ClientErrorUnionSubType> clientErrorSubTypes = httpEndpoint.getErrors().get().stream()
                .map(responseError -> {
                    ErrorDeclaration errorDeclaration =
                            generatorContext.getErrorDefinitionsByName().get(responseError.getError());
                    IGeneratedFile generatedClientError = generatedClientErrors.get(responseError.getError());
                    return new ClientErrorUnionSubType(
                            exceptionClassName,
                            errorDeclaration,
                            generatedClientError,
                            generatorContext.getFernConstants());
                })
                .collect(Collectors.toList());
        ClientErrorUnionOtherSubType clientErrorUnionOtherSubType =
                new ClientErrorUnionOtherSubType(exceptionClassName);
        ClientErrorUnionGenerator clientErrorUnionGenerator = new ClientErrorUnionGenerator(
                exceptionClassName,
                clientErrorSubTypes,
                clientErrorUnionOtherSubType,
                generatorContext.getFernConstants());
        TypeSpec exceptionTypeSpec = clientErrorUnionGenerator.generateErrorUnion();
        JavaFile exceptionFile = JavaFile.builder(exceptionClassName.packageName(), exceptionTypeSpec)
                .build();
        return GeneratedFile.builder()
                .file(exceptionFile)
                .className(exceptionClassName)
                .build();
    }
}
