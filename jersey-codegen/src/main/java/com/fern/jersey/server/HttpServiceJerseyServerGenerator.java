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
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratedHttpServiceServer;
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.codegen.utils.HttpAuthParameterSpecsUtils;
import com.fern.codegen.utils.HttpPathUtils;
import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.errors.DeclaredErrorName;
import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpEndpointId;
import com.fern.ir.model.services.http.HttpService;
import com.fern.jersey.JerseyHttpMethodAnnotationVisitor;
import com.fern.jersey.JerseyServiceGeneratorUtils;
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

    private final HttpService httpService;
    private final ClassName generatedServiceClassName;
    private final JerseyServiceGeneratorUtils jerseyServiceGeneratorUtils;
    private final Map<HttpEndpointId, GeneratedEndpointModel> generatedEndpointModels;
    private final Map<DeclaredErrorName, GeneratedError> generatedErrors;
    private final Map<AuthScheme, GeneratedFile> generatedAuthSchemes;

    public HttpServiceJerseyServerGenerator(
            GeneratorContext generatorContext,
            Map<DeclaredErrorName, GeneratedError> generatedErrors,
            Map<HttpEndpointId, GeneratedEndpointModel> generatedEndpointModels,
            Map<AuthScheme, GeneratedFile> generatedAuthSchemes,
            HttpService httpService) {
        super(generatorContext);
        this.httpService = httpService;
        this.generatedErrors = generatedErrors;
        this.generatedServiceClassName = generatorContext
                .getClassNameUtils()
                .getClassNameFromServiceName(httpService.getName(), PackageType.SERVER);
        this.jerseyServiceGeneratorUtils = new JerseyServiceGeneratorUtils(generatorContext);
        this.generatedEndpointModels = generatedEndpointModels;
        this.generatedAuthSchemes = generatedAuthSchemes;
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
                .addMember("value", "$S", httpService.getBasePath().orElse("/"))
                .build());
        Map<HttpEndpointId, MethodSpec> endpointToMethodSpec = new LinkedHashMap<>();
        httpService.getEndpoints().forEach(httpEndpoint -> {
            endpointToMethodSpec.put(httpEndpoint.getId(), getHttpEndpointMethodSpec(httpEndpoint));
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
                        httpEndpoint.getId().get())
                .addAnnotation(httpEndpoint.getMethod().visit(JerseyHttpMethodAnnotationVisitor.INSTANCE))
                .addAnnotation(AnnotationSpec.builder(Path.class)
                        .addMember(
                                "value", "$S", HttpPathUtils.getPathWithCurlyBracedPathParams(httpEndpoint.getPath()))
                        .build())
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT);

        HttpAuthParameterSpecsUtils httpAuthParameterSpecsUtils =
                new HttpAuthParameterSpecsUtils(HeaderParam.class, generatorContext, generatedAuthSchemes);
        endpointMethodBuilder.addParameters(httpAuthParameterSpecsUtils.getAuthParameters(httpEndpoint));

        httpService.getHeaders().stream()
                .map(jerseyServiceGeneratorUtils::getHeaderParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.getHeaders().stream()
                .map(jerseyServiceGeneratorUtils::getHeaderParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.getPathParameters().stream()
                .map(jerseyServiceGeneratorUtils::getPathParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.getQueryParameters().stream()
                .map(jerseyServiceGeneratorUtils::getQueryParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        GeneratedEndpointModel generatedEndpointModel = generatedEndpointModels.get(httpEndpoint.getId());
        jerseyServiceGeneratorUtils
                .getPayloadTypeName(generatedEndpointModel.generatedHttpRequest())
                .ifPresent(typeName -> {
                    endpointMethodBuilder.addParameter(
                            ParameterSpec.builder(typeName, "request").build());
                });
        Optional<TypeName> returnPayload =
                jerseyServiceGeneratorUtils.getPayloadTypeName(generatedEndpointModel.generatedHttpResponse());
        returnPayload.ifPresent(endpointMethodBuilder::returns);

        List<ClassName> errorClassNames = httpEndpoint.getErrors().get().stream()
                .map(responseError ->
                        generatedErrors.get(responseError.getError()).className())
                .collect(Collectors.toList());
        endpointMethodBuilder.addExceptions(errorClassNames);
        return endpointMethodBuilder.build();
    }
}
