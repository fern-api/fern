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
package com.fern.jersey.server;

import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedHttpServiceServer;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.codegen.utils.server.HttpAuthParameterSpecVisitor;
import com.fern.codegen.utils.server.HttpPathUtils;
import com.fern.jersey.JerseyHttpMethodAnnotationVisitor;
import com.fern.jersey.JerseyServiceGeneratorUtils;
import com.fern.model.codegen.Generator;
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
import javax.ws.rs.Consumes;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

public final class HttpServiceJerseyServerGenerator extends Generator {

    private static final HttpAuthParameterSpecVisitor JERSEY_AUTH_PARAMATER_SPEC_VISITOR =
            new HttpAuthParameterSpecVisitor(HeaderParam.class);

    private final HttpService httpService;
    private final ClassName generatedServiceClassName;
    private final JerseyServiceGeneratorUtils jerseyServiceGeneratorUtils;
    private final Map<EndpointId, GeneratedEndpointModel> generatedEndpointModels;
    private final Map<ErrorName, GeneratedError> generatedErrors;

    public HttpServiceJerseyServerGenerator(
            GeneratorContext generatorContext,
            Map<ErrorName, GeneratedError> generatedErrors,
            Map<EndpointId, GeneratedEndpointModel> generatedEndpointModels,
            HttpService httpService) {
        super(generatorContext, PackageType.SERVER);
        this.httpService = httpService;
        this.generatedErrors = generatedErrors;
        this.generatedServiceClassName =
                generatorContext.getClassNameUtils().getClassNameFromServiceName(httpService.name(), packageType);
        this.jerseyServiceGeneratorUtils = new JerseyServiceGeneratorUtils(generatorContext);
        this.generatedEndpointModels = generatedEndpointModels;
    }

    @Override
    public GeneratedHttpServiceServer generate() {
        TypeSpec.Builder jerseyServiceBuilder = TypeSpec.interfaceBuilder(generatedServiceClassName)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(AnnotationSpec.builder(Consumes.class)
                        .addMember("value", "$T.APPLICATION_JSON", MediaType.class)
                        .build())
                .addAnnotation(AnnotationSpec.builder(Produces.class)
                        .addMember("value", "$T.APPLICATION_JSON", MediaType.class)
                        .build());
        jerseyServiceBuilder.addAnnotation(AnnotationSpec.builder(Path.class)
                .addMember("value", "$S", httpService.basePath().orElse("/"))
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
                .addAnnotation(httpEndpoint.method().visit(JerseyHttpMethodAnnotationVisitor.INSTANCE))
                .addAnnotation(AnnotationSpec.builder(Path.class)
                        .addMember("value", "$S", HttpPathUtils.getPathWithCurlyBracedPathParams(httpEndpoint.path()))
                        .build())
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT);
        httpEndpoint.auth().visit(JERSEY_AUTH_PARAMATER_SPEC_VISITOR).ifPresent(endpointMethodBuilder::addParameter);
        httpService.headers().stream()
                .map(jerseyServiceGeneratorUtils::getHeaderParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.headers().stream()
                .map(jerseyServiceGeneratorUtils::getHeaderParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.pathParameters().stream()
                .map(jerseyServiceGeneratorUtils::getPathParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.queryParameters().stream()
                .map(jerseyServiceGeneratorUtils::getQueryParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        GeneratedEndpointModel generatedEndpointModel = generatedEndpointModels.get(httpEndpoint.endpointId());
        jerseyServiceGeneratorUtils
                .getPayloadTypeName(generatedEndpointModel.generatedHttpRequest())
                .ifPresent(typeName -> {
                    endpointMethodBuilder.addParameter(
                            ParameterSpec.builder(typeName, "request").build());
                });
        Optional<TypeName> returnPayload =
                jerseyServiceGeneratorUtils.getPayloadTypeName(generatedEndpointModel.generatedHttpResponse());
        returnPayload.ifPresent(endpointMethodBuilder::returns);

        List<ClassName> errorClassNames = httpEndpoint.errors().value().stream()
                .map(responseError -> generatedErrors.get(responseError.error()).className())
                .collect(Collectors.toList());
        endpointMethodBuilder.addExceptions(errorClassNames);
        return endpointMethodBuilder.build();
    }
}
