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

import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedErrorDecoder;
import com.fern.codegen.GeneratedHttpServiceClient;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.exception.UnknownRemoteException;
import com.fern.jersey.HttpAuthToParameterSpec;
import com.fern.jersey.HttpMethodAnnotationVisitor;
import com.fern.jersey.HttpPathUtils;
import com.fern.jersey.JerseyServiceGeneratorUtils;
import com.fern.model.codegen.Generator;
import com.fern.types.ErrorName;
import com.fern.types.services.HttpEndpoint;
import com.fern.types.services.HttpResponse;
import com.fern.types.services.HttpService;
import com.palantir.common.streams.KeyedStream;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeSpec;
import feign.Feign;
import feign.jackson.JacksonDecoder;
import feign.jackson.JacksonEncoder;
import feign.jaxrs.JAXRSContract;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import javax.ws.rs.Consumes;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

public final class HttpServiceClientGenerator extends Generator {

    private static final String CLIENT_CLASS_NAME_SUFFIX = "client";

    private static final String GET_CLIENT_METHOD_NAME = "getClient";

    private final HttpService httpService;
    private final ClassName generatedServiceClassName;
    private final Map<ErrorName, GeneratedError> generatedErrors;
    private final JerseyServiceGeneratorUtils jerseyServiceGeneratorUtils;
    private final Map<HttpEndpoint, GeneratedEndpointModel> generatedEndpointModels;

    public HttpServiceClientGenerator(
            GeneratorContext generatorContext,
            List<GeneratedEndpointModel> generatedEndpointModels,
            Map<ErrorName, GeneratedError> generatedErrors,
            HttpService httpService) {
        super(generatorContext, PackageType.CLIENT);
        this.httpService = httpService;
        this.generatedServiceClassName = generatorContext
                .getClassNameUtils()
                .getClassNameFromServiceName(httpService.name(), packageType, CLIENT_CLASS_NAME_SUFFIX);
        this.jerseyServiceGeneratorUtils = new JerseyServiceGeneratorUtils(generatorContext);
        this.generatedEndpointModels = generatedEndpointModels.stream()
                .collect(Collectors.toMap(GeneratedEndpointModel::httpEndpoint, Function.identity()));
        this.generatedErrors = generatedErrors;
    }

    @Override
    public GeneratedHttpServiceClient generate() {
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
        List<MethodSpec> httpEndpointMethods = httpService.endpoints().stream()
                .map(this::getHttpEndpointMethodSpec)
                .collect(Collectors.toList());
        Optional<GeneratedErrorDecoder> maybeGeneratedErrorDecoder = getGeneratedErrorDecoder();
        TypeSpec jerseyServiceTypeSpec = jerseyServiceBuilder
                .addMethods(httpEndpointMethods)
                .addMethod(getStaticClientBuilderMethod(maybeGeneratedErrorDecoder))
                .build();
        JavaFile jerseyServiceJavaFile = JavaFile.builder(
                        generatedServiceClassName.packageName(), jerseyServiceTypeSpec)
                .build();
        return GeneratedHttpServiceClient.builder()
                .file(jerseyServiceJavaFile)
                .className(generatedServiceClassName)
                .httpService(httpService)
                .generatedErrorDecoder(maybeGeneratedErrorDecoder)
                .build();
    }

    private MethodSpec getHttpEndpointMethodSpec(HttpEndpoint httpEndpoint) {
        MethodSpec.Builder endpointMethodBuilder = MethodSpec.methodBuilder(
                        httpEndpoint.endpointId().value())
                .addAnnotation(httpEndpoint.method().visit(HttpMethodAnnotationVisitor.INSTANCE))
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT);
        endpointMethodBuilder.addAnnotation(AnnotationSpec.builder(Path.class)
                .addMember("value", "$S", HttpPathUtils.getJerseyCompatiblePath(httpEndpoint.path()))
                .build());
        httpEndpoint.auth().visit(new HttpAuthToParameterSpec()).ifPresent(endpointMethodBuilder::addParameter);
        httpEndpoint.headers().stream()
                .map(jerseyServiceGeneratorUtils::getHeaderParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.pathParameters().stream()
                .map(jerseyServiceGeneratorUtils::getPathParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.queryParameters().stream()
                .map(jerseyServiceGeneratorUtils::getQueryParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        GeneratedEndpointModel generatedEndpointModel = generatedEndpointModels.get(httpEndpoint);
        jerseyServiceGeneratorUtils
                .getPayloadTypeName(generatedEndpointModel.generatedHttpRequest())
                .ifPresent(typeName -> {
                    endpointMethodBuilder.addParameter(
                            ParameterSpec.builder(typeName, "request").build());
                });
        jerseyServiceGeneratorUtils
                .getPayloadTypeName(generatedEndpointModel.generatedHttpResponse())
                .ifPresent(endpointMethodBuilder::returns);

        List<ClassName> errorClassNames = httpEndpoint.response().failed().errors().stream()
                .map(responseError -> generatedErrors.get(responseError.error()).className())
                .collect(Collectors.toList());
        endpointMethodBuilder.addExceptions(errorClassNames);
        if (!errorClassNames.isEmpty()) {
            endpointMethodBuilder.addException(ClassName.get(UnknownRemoteException.class));
        }
        return endpointMethodBuilder.build();
    }

    private Optional<GeneratedErrorDecoder> getGeneratedErrorDecoder() {
        Optional<GeneratedErrorDecoder> maybeGeneratedErrorDecoder = Optional.empty();
        boolean shouldGenerateErrorDecoder = httpService.endpoints().stream()
                        .map(HttpEndpoint::response)
                        .map(HttpResponse::failed)
                        .flatMap(failedResponse -> failedResponse.errors().stream())
                        .count()
                > 0;
        if (shouldGenerateErrorDecoder) {
            ServiceErrorDecoderGenerator serviceErrorDecoderGenerator = new ServiceErrorDecoderGenerator(
                    generatorContext,
                    httpService,
                    KeyedStream.stream(generatedEndpointModels)
                            .map(GeneratedEndpointModel::errorFile)
                            .collectToMap());
            maybeGeneratedErrorDecoder = Optional.of(serviceErrorDecoderGenerator.generate());
        }
        return maybeGeneratedErrorDecoder;
    }

    private MethodSpec getStaticClientBuilderMethod(Optional<GeneratedErrorDecoder> generatedErrorDecoder) {
        CodeBlock.Builder codeBlockBuilder = CodeBlock.builder()
                .add("return $T.builder()\n", Feign.class)
                .indent()
                .indent()
                .add(".contract(new $T())\n", JAXRSContract.class)
                .add(
                        ".decoder(new $T($T.$L))\n",
                        JacksonDecoder.class,
                        ClassNameUtils.CLIENT_OBJECT_MAPPERS_CLASS_NAME,
                        ClassNameUtils.CLIENT_OBJECT_MAPPERS_JSON_MAPPER_FIELD_NAME)
                .add(
                        ".encoder(new $T($T.$L))\n",
                        JacksonEncoder.class,
                        ClassNameUtils.CLIENT_OBJECT_MAPPERS_CLASS_NAME,
                        ClassNameUtils.CLIENT_OBJECT_MAPPERS_JSON_MAPPER_FIELD_NAME);
        if (generatedErrorDecoder.isPresent()) {
            codeBlockBuilder.add(
                    ".errorDecoder(new $T())", generatedErrorDecoder.get().className());
        }
        codeBlockBuilder.add(".target($T.class, $L);", generatedServiceClassName, "url");
        CodeBlock codeBlock = codeBlockBuilder.unindent().unindent().build();
        return MethodSpec.methodBuilder(GET_CLIENT_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(ClassNameUtils.STRING_CLASS_NAME, "url")
                .returns(generatedServiceClassName)
                .addCode(codeBlock)
                .build();
    }
}
