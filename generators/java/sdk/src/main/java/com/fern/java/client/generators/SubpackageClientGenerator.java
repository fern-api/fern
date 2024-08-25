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

package com.fern.java.client.generators;

import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.ir.Subpackage;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClient;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.generators.ClientGeneratorUtils.Result;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.JavaFile;
import java.util.Map;

public final class SubpackageClientGenerator extends AbstractFileGenerator {
    private final GeneratedObjectMapper generatedObjectMapper;
    private final ClientGeneratorContext clientGeneratorContext;
    private final GeneratedClientOptions generatedClientOptions;
    private final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final GeneratedJavaFile generatedSuppliersFile;
    private final GeneratedEnvironmentsClass generatedEnvironmentsClass;
    private final Subpackage subpackage;
    private final GeneratedJavaFile requestOptionsFile;
    private final Map<ErrorId, GeneratedJavaFile> generatedErrors;

    public SubpackageClientGenerator(
            Subpackage subpackage,
            AbstractGeneratorContext<?, ?> generatorContext,
            GeneratedObjectMapper generatedObjectMapper,
            ClientGeneratorContext clientGeneratorContext,
            GeneratedClientOptions generatedClientOptions,
            GeneratedJavaFile generatedSuppliersFile,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            GeneratedJavaFile requestOptionsFile,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            Map<ErrorId, GeneratedJavaFile> generatedErrors) {
        super(clientGeneratorContext.getPoetClassNameFactory().getClientClassName(subpackage), generatorContext);
        this.generatedObjectMapper = generatedObjectMapper;
        this.clientGeneratorContext = clientGeneratorContext;
        this.generatedClientOptions = generatedClientOptions;
        this.generatedSuppliersFile = generatedSuppliersFile;
        this.allGeneratedInterfaces = allGeneratedInterfaces;
        this.generatedEnvironmentsClass = generatedEnvironmentsClass;
        this.requestOptionsFile = requestOptionsFile;
        this.subpackage = subpackage;
        this.generatedErrors = generatedErrors;
    }

    @Override
    public GeneratedClient generateFile() {
        ClientGeneratorUtils clientGeneratorUtils = new ClientGeneratorUtils(
                className,
                clientGeneratorContext,
                generatedClientOptions,
                generatedObjectMapper,
                generatedEnvironmentsClass,
                allGeneratedInterfaces,
                generatedSuppliersFile,
                requestOptionsFile,
                subpackage,
                generatedErrors);
        Result result = clientGeneratorUtils.buildClients();
        return GeneratedClient.builder()
                .className(className)
                .javaFile(JavaFile.builder(
                                className.packageName(), result.getClientImpl().build())
                        .build())
                .addAllWrappedRequests(result.getGeneratedWrappedRequests())
                .build();
    }
}
