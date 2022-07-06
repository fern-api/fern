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
package com.fern.spring.server;

import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedHttpServiceServer;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.codegen.utils.server.HttpAuthParameterSpecVisitor;
import com.fern.model.codegen.Generator;
import com.fern.spring.SpringHttpMethodAnnotationVisitor;
import com.fern.spring.SpringServiceGeneratorUtils;
import com.fern.types.ErrorName;
import com.fern.types.services.EndpointId;
import com.fern.types.services.HttpEndpoint;
import com.fern.types.services.HttpService;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.springframework.web.bind.annotation.RequestMapping;

public final class HttpServiceSpringServerGenerator extends Generator {

    private final HttpService httpService;
    private final ClassName generatedServiceClassName;
    private final SpringServiceGeneratorUtils springServiceGeneratorUtils;
    private final Map<EndpointId, GeneratedEndpointModel> generatedEndpointModels;
    private final Map<ErrorName, GeneratedError> generatedErrors;

    public HttpServiceSpringServerGenerator(
            GeneratorContext generatorContext,
            Map<ErrorName, GeneratedError> generatedErrors,
            Map<EndpointId, GeneratedEndpointModel> generatedEndpointModels,
            HttpService httpService) {
        super(generatorContext, PackageType.SERVER);
        this.httpService = httpService;
        this.generatedErrors = generatedErrors;
        this.generatedServiceClassName =
                generatorContext.getClassNameUtils().getClassNameFromServiceName(httpService.name(), packageType);
        this.springServiceGeneratorUtils = new SpringServiceGeneratorUtils(generatorContext);
        this.generatedEndpointModels = generatedEndpointModels;
    }

    @Override
    public GeneratedHttpServiceServer generate() {
        TypeSpec.Builder jerseyServiceBuilder = TypeSpec.interfaceBuilder(generatedServiceClassName)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(AnnotationSpec.builder(RequestMapping.class)
                        .addMember("path", "$S", httpService.basePath().orElse("/"))
                        .addMember("consumes", "$S", "application/json")
                        .addMember("produces", "$S", "application/json")
                        .build());
        Map<EndpointId, MethodSpec> endpointToMethodSpec = new LinkedHashMap<>();
        httpService.endpoints().forEach(httpEndpoint -> {
            endpointToMethodSpec.put(httpEndpoint.endpointId(), getHttpEndpointMethodSpec(httpEndpoint));
        });
        TypeSpec jerseyServiceTypeSpec =
                jerseyServiceBuilder.addMethods(endpointToMethodSpec.values()).build();
        JavaFile jerseyServiceJavaFile = JavaFile.builder(
                        generatedServiceClassName.packageName(), jerseyServiceTypeSpec)
                .build();
        return GeneratedHttpServiceServer.builder()
                .file(jerseyServiceJavaFile)
                .className(generatedServiceClassName)
                .httpService(httpService)
                .putAllMethodsByEndpointId(endpointToMethodSpec)
                .build();
    }

    private MethodSpec getHttpEndpointMethodSpec(HttpEndpoint httpEndpoint) {
        MethodSpec.Builder endpointMethodBuilder = MethodSpec.methodBuilder(
                        httpEndpoint.endpointId().value())
                .addAnnotation(httpEndpoint.method().visit(new SpringHttpMethodAnnotationVisitor(httpEndpoint)))
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT);
        httpEndpoint.auth().visit(HttpAuthParameterSpecVisitor.INSTANCE).ifPresent(endpointMethodBuilder::addParameter);
        httpService.headers().stream()
                .map(springServiceGeneratorUtils::getHeaderParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.headers().stream()
                .map(springServiceGeneratorUtils::getHeaderParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.pathParameters().stream()
                .map(springServiceGeneratorUtils::getPathParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.queryParameters().stream()
                .map(springServiceGeneratorUtils::getQueryParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        GeneratedEndpointModel generatedEndpointModel = generatedEndpointModels.get(httpEndpoint.endpointId());
        springServiceGeneratorUtils
                .getPayloadTypeName(generatedEndpointModel.generatedHttpRequest())
                .ifPresent(typeName -> {
                    endpointMethodBuilder.addParameter(
                            ParameterSpec.builder(typeName, "request").build());
                });
        Optional<TypeName> returnPayload =
                springServiceGeneratorUtils.getPayloadTypeName(generatedEndpointModel.generatedHttpResponse());
        returnPayload.ifPresent(endpointMethodBuilder::returns);

        List<ClassName> errorClassNames = httpEndpoint.response().failed().errors().stream()
                .map(responseError -> generatedErrors.get(responseError.error()).className())
                .collect(Collectors.toList());
        endpointMethodBuilder.addExceptions(errorClassNames);
        return endpointMethodBuilder.build();
    }
}
